import fs from 'fs/promises';
import path from 'path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, unlit } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder } from 'meshoptimizer';

const inputRoot = path.join(process.cwd(), 'public/models/glb');
const outputRoot = path.join(process.cwd(), 'public/models/glb-legacy');
const failuresPath = path.join(process.cwd(), 'asset-manifests', 'glb-legacy-failures.txt');
const itemsPath = path.join(process.cwd(), 'public/items.json');

const supportedTextureMimeTypes = new Set(['image/png', 'image/jpeg']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.glb')) {
      results.push(full);
    }
  }
  return results;
}

async function updateItemsJson() {
  let raw;
  try {
    raw = await fs.readFile(itemsPath, 'utf8');
  } catch (err) {
    console.warn('[legacy-glb] items.json not found, skipping update.');
    return;
  }
  const data = JSON.parse(raw);
  if (Array.isArray(data.items)) {
    for (const item of data.items) {
      if (typeof item.model === 'string' && item.model.includes('models/glb/')) {
        item.model = item.model.replace('models/glb/', 'models/glb-legacy/');
      }
    }
  }
  data.generatedAt = new Date().toISOString();
  await fs.writeFile(itemsPath, JSON.stringify(data, null, 2));
}

async function main() {
  const dracoDecoder = await draco3d.createDecoderModule();
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.decoder': dracoDecoder,
      'meshopt.decoder': MeshoptDecoder,
    });

  const files = await walk(inputRoot);
  if (files.length === 0) {
    console.log('[legacy-glb] No GLB files found.');
    return;
  }

  const failures = [];
  let processed = 0;

  for (const src of files) {
    const rel = path.relative(inputRoot, src);
    const dest = path.join(outputRoot, rel);
    try {
      await fs.access(dest);
      // Skip files already converted.
      processed += 1;
      if (processed % 50 === 0) {
        console.log(`[legacy-glb] ${processed}/${files.length} processed...`);
      }
      continue;
    } catch {
      // File does not exist; convert it.
    }

    try {
      const doc = await io.read(src);
      const root = doc.getRoot();

      // Remove animations and skins (Blueprint3D does not use them).
      for (const node of root.listNodes()) {
        node.setSkin(null);
      }
      for (const skin of root.listSkins()) {
        skin.dispose();
      }
      for (const anim of root.listAnimations()) {
        anim.dispose();
      }

      // Remove morph targets (avoid loader errors in old three.js).
      for (const mesh of root.listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
          // Strip Draco extension after decoding (avoid encoder requirement).
          if (prim.getExtension('KHR_draco_mesh_compression')) {
            prim.setExtension('KHR_draco_mesh_compression', null);
          }
          for (const target of prim.listTargets()) {
            prim.removeTarget(target);
          }
        }
      }
      // Remove compression extensions from the document to avoid encoder dependencies.
      doc.disposeExtension('KHR_draco_mesh_compression');
      doc.disposeExtension('EXT_meshopt_compression');

      // Drop unsupported textures to avoid runtime errors (KTX2, etc.).
      for (const material of root.listMaterials()) {
        const maybeClear = (getter, setter) => {
          const tex = getter.call(material);
          if (tex && !supportedTextureMimeTypes.has(tex.getMimeType())) {
            setter.call(material, null);
          }
        };
        maybeClear(material.getBaseColorTexture, material.setBaseColorTexture);
        maybeClear(material.getMetallicRoughnessTexture, material.setMetallicRoughnessTexture);
        maybeClear(material.getNormalTexture, material.setNormalTexture);
        maybeClear(material.getOcclusionTexture, material.setOcclusionTexture);
        maybeClear(material.getEmissiveTexture, material.setEmissiveTexture);
      }

      // Simplify materials for compatibility.
      await doc.transform(
        unlit(),
        dedup({ textures: true, materials: true }),
        prune()
      );

      await fs.mkdir(path.dirname(dest), { recursive: true });
      await io.write(dest, doc);
    } catch (err) {
      failures.push(`${rel} :: ${err && err.message ? err.message : String(err)}`);
    }

    processed += 1;
    if (processed % 50 === 0) {
      console.log(`[legacy-glb] ${processed}/${files.length} processed...`);
    }
  }

  await fs.mkdir(path.dirname(failuresPath), { recursive: true });
  await fs.writeFile(failuresPath, failures.join('\n'));
  await updateItemsJson();

  console.log(`[legacy-glb] Done. Converted: ${files.length - failures.length}/${files.length}`);
  if (failures.length) {
    console.log(`[legacy-glb] Failures written to ${failuresPath}`);
  }
}

main().catch((err) => {
  console.error('[legacy-glb] Fatal error:', err);
  process.exit(1);
});
