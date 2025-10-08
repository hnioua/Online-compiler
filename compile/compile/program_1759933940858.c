
#include <stdio.h>
int main() {
  int a, b;
  printf("Entrez le premier nombre: ");
  fflush(stdout);
  scanf("%d", &a);
  printf("Entrez le deuxième nombre: ");
  fflush(stdout);
  scanf("%d", &b);
  printf("La somme est: %d\n", a + b);
  return 0;
}
