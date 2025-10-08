#include <stdio.h>

int main() {
    int a, b;

    printf("Entrez le 1er nombre: ");
    fflush(stdout);  // vide le buffer pour forcer l'affichage immédiat du texte
    scanf("%d", &a);
    printf("Vous avez saisi : %d\n", a);

    printf("Entrez le 2e nombre: ");
    fflush(stdout);
    scanf("%d", &b);
    printf("Vous avez saisi : %d\n", b);

    printf("\nRésultat final : %d et %d\n", a, b);
    return 0;
}
