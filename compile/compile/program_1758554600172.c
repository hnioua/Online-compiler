#include <stdio.h>
#include <stdlib.h>

int main() {
    int a, b, somme;
    
    // Flusher la sortie standard après chaque printf
    printf("Entrez le premier nombre : ");
    fflush(stdout);  // Force l'affichage immédiat
    
    scanf("%d", &a);
    
    printf("Entrez le deuxième nombre : ");
    fflush(stdout);  // Force l'affichage immédiat
    
    scanf("%d", &b);
    
    somme = a + b;
    printf("La somme de %d et %d est %d\n", a, b, somme);
    
    return 0;
}