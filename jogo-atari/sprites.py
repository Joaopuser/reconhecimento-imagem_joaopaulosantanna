import pygame
import random
from settings import *

class Ship(pygame.sprite.Sprite):
    def __init__(self, all_sprites, bullets):
        super().__init__()
        # Usando um retângulo verde para representar a nave
        self.image = pygame.Surface((50, 40))
        self.image.fill(GREEN)
        self.rect = self.image.get_rect()
        self.rect.centerx = WIDTH // 2
        self.rect.bottom = HEIGHT - 20
        self.speedx = 0
        
        self.all_sprites = all_sprites
        self.bullets = bullets

    def update(self):
        self.speedx = 0
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT]:
            self.speedx = -PLAYER_SPEED
        if keys[pygame.K_RIGHT]:
            self.speedx = PLAYER_SPEED
            
        self.rect.x += self.speedx
        
        # Manter a nave dentro da tela
        if self.rect.right > WIDTH:
            self.rect.right = WIDTH
        if self.rect.left < 0:
            self.rect.left = 0

    def shoot(self):
        bullet = Projectile(self.rect.centerx, self.rect.top)
        self.all_sprites.add(bullet)
        self.bullets.add(bullet)

class Asteroid(pygame.sprite.Sprite):
    def __init__(self, min_speed, max_speed):
        super().__init__()
        # Tamanho aleatório para o asteroide
        size = random.randint(20, 50)
        self.image = pygame.Surface((size, size))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        # Posição inicial no topo, em uma posição x aleatória
        self.rect.x = random.randint(0, WIDTH - self.rect.width)
        self.rect.y = random.randint(-100, -40)
        self.exact_y = float(self.rect.y)
        self.speedy = random.uniform(min_speed, max_speed)

    def update(self):
        self.exact_y += self.speedy
        self.rect.y = int(self.exact_y)

class Projectile(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((5, 15))
        self.image.fill(YELLOW)
        self.rect = self.image.get_rect()
        self.rect.centerx = x
        self.rect.bottom = y
        self.speedy = BULLET_SPEED

    def update(self):
        self.rect.y += self.speedy
        # Destruir se o projétil sair da tela
        if self.rect.bottom < 0:
            self.kill()
