// Compresse une image côté client AVANT l'upload d'une pièce justificative.
// Motivation : les utilisateurs déposent souvent une photo de CNI prise au téléphone (plusieurs
// Mo). Sur le chemin réseau du site (rewrite Vercel → tunnel → backend), ces gros fichiers sont
// le principal poste de latence relevé par le test de charge (jusqu'à ~30 s). Un redimensionnement
// + ré-encodage JPEG réduit la taille de 5 à 10× tout en gardant une pièce parfaitement lisible.
//
// Sûr par construction : ne touche QUE les JPEG/PNG (les PDF passent inchangés) et, si le résultat
// n'est pas plus léger ou si quoi que ce soit échoue, renvoie le fichier d'origine.
export async function compressImage(file: File, maxDim = 2000, quality = 0.85): Promise<File> {
  if (!/^image\/(jpe?g|png)$/i.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // Fond blanc : le JPEG ne gère pas la transparence (un PNG transparent virerait au noir).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob || blob.size >= file.size) return file; // aucun gain → on garde l'original

    const name = file.name.replace(/\.(png|jpe?g)$/i, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file; // navigateur incompatible / image illisible → on n'altère rien
  }
}
