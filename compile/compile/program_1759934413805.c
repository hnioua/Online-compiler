 #include <stdio.h>
        
        int main() {
            int a, b;
            printf("Entrez le premier nombre: ");
            fflush(stdout); // S'assurer que le prompt est affiché
            scanf("%d", &a);
            
            printf("Entrez le deuxième nombre: ");
            fflush(stdout); // S'assurer que le prompt est affiché
            scanf("%d", &b);
            
            printf("La somme est: %d", a + b);
            return 0;
        }