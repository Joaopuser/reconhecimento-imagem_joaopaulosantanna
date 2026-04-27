# Explicação da Função is_prime

Esta função verifica se um número inteiro é primo. Um número primo é maior que 1 e não tem divisores positivos além de 1 e ele mesmo.

## Código

```python
def is_prime(n):
    """
    Verifica se um número é primo.
    
    Args:
        n (int): O número a ser verificado.
    
    Returns:
        bool: True se o número for primo, False caso contrário.
    """
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True
```

## Explicação Linha a Linha

1. `def is_prime(n):` - Define a função chamada `is_prime` que recebe um parâmetro `n` (o número a ser verificado).

2. `"""` - Início da docstring (documentação da função).

3. `Verifica se um número é primo.` - Descrição breve da função.

4. - Linha em branco na docstring.

5. `Args:` - Seção que descreve os argumentos da função.

6. `n (int): O número a ser verificado.` - Descrição do parâmetro `n`, indicando que deve ser um inteiro.

7. - Linha em branco.

8. `Returns:` - Seção que descreve o valor de retorno.

9. `bool: True se o número for primo, False caso contrário.` - Descrição do retorno, um booleano.

10. `"""` - Fim da docstring.

11. `if n <= 1:` - Verifica se `n` é menor ou igual a 1.

12. `return False` - Se a condição acima for verdadeira, retorna `False`, pois números ≤ 1 não são primos.

13. `if n <= 3:` - Verifica se `n` é menor ou igual a 3.

14. `return True` - Se verdadeiro, retorna `True`, pois 2 e 3 são números primos.

15. `if n % 2 == 0 or n % 3 == 0:` - Verifica se `n` é divisível por 2 ou por 3 (usando o operador módulo `%`).

16. `return False` - Se divisível, retorna `False`, pois não é primo.

17. `i = 5` - Inicializa a variável `i` com 5 (começando a verificar divisores a partir de 5).

18. `while i * i <= n:` - Loop `while` que continua enquanto o quadrado de `i` for menor ou igual a `n` (otimização para verificar apenas até a raiz quadrada de `n`).

19. `if n % i == 0 or n % (i + 2) == 0:` - Dentro do loop, verifica se `n` é divisível por `i` ou por `i + 2` (checando números da forma 6k ± 1).

20. `return False` - Se divisível, retorna `False`.

21. `i += 6` - Incrementa `i` por 6 para pular para o próximo candidato (6k + 1).

22. `return True` - Se o loop terminar sem encontrar divisores, retorna `True`, indicando que `n` é primo.