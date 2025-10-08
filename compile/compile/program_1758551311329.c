#include <stdio.h>

int main() {
    int a, b, somme;

    // Demander à l'utilisateur de saisir deux nombres
    printf("Entrez le premier nombre : ");
    scanf("%d", &a);

    printf("Entrez le deuxième nombre : ");
    scanf("%d", &b);

    // Calcul de la somme
    somme = a + b;

    // Affichage du résultat
    printf("La somme de %d et %d est %d\n", a, b, somme);

    return 0;
}
