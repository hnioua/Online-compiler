#include <stdio.h>
#include <stdlib.h>

int main() {
    int x = 10;
    int y = 5; // y corrigé à une valeur non nulle
    int z = x / y;

    int *ptr = (int*)malloc(sizeof(int));
    
    // Ajout d'une vérification de l'allocation mémoire
    if (ptr == NULL) {
        perror("Erreur d'allocation memoire");
        return 1;
    }

    *ptr = 100;
    
    // L'affichage doit se faire avant la libération de la mémoire (correction de l'erreur 'use-after-free')
    printf("Valeur stockée dans ptr : %d\n", *ptr);
    printf("Résultat de la division (z) : %d\n", z);
    
    free(ptr);
    
    return 0;
}