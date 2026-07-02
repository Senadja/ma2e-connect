// Correctif de compatibilité Google Translate ⨯ React.
//
// Le site est traduit (EN, ES, AR…) par Google Website Translate, qui remplace
// des nœuds texte du DOM. Quand React met ensuite le DOM à jour (changement d'état,
// refetch React Query, navigation), il appelle removeChild/insertBefore sur des nœuds
// que Google a déplacés/remplacés → « NotFoundError: Failed to execute 'removeChild' ».
//
// On rend ces deux opérations tolérantes : si le nœud visé n'est pas (ou plus) enfant
// du parent attendu, on ne lève plus d'exception (no-op). Correctif largement utilisé
// pour faire cohabiter React et Google Translate. Sans effet quand la page n'est pas traduite.
if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      if (typeof console !== "undefined") {
        console.warn("[gtranslate-fix] removeChild ignoré : nœud déjà déplacé par la traduction.", child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (typeof console !== "undefined") {
        console.warn("[gtranslate-fix] insertBefore : nœud de référence déplacé par la traduction, ajout en fin.", referenceNode);
      }
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

export {};
