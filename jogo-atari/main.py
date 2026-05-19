# pyrefly: ignore [missing-import]
import pygame
import sys
from settings import *
from sprites import Ship, Asteroid, Projectile

class Game:
    def __init__(self):
        # Inicialização do Pygame
        pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("Asteroids - Estilo Atari")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont(None, 36)
        
        self.running = True
        self.game_over = False
        self.score = 0
        
        self.last_spawn = pygame.time.get_ticks()
        
        self.new()

    def new(self):
        # Inicializa um novo jogo
        self.game_over = False
        self.score = 0
        
        self.all_sprites = pygame.sprite.Group()
        self.asteroids = pygame.sprite.Group()
        self.bullets = pygame.sprite.Group()
        
        self.player = Ship(self.all_sprites, self.bullets)
        self.all_sprites.add(self.player)
        
        self.run()

    def run(self):
        # Game Loop
        while self.running:
            self.clock.tick(FPS)
            self.events()
            
            if not self.game_over:
                self.update()
                
            self.draw()

    def events(self):
        # Tratamento de eventos (input do usuário e fechamento da janela)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                pygame.quit()
                sys.exit()
                
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and not self.game_over:
                    self.player.shoot()
                # Reiniciar jogo se estiver em game over
                if event.key == pygame.K_r and self.game_over:
                    self.new()

    def update(self):
        # Aumentar a dificuldade de acordo com a pontuação
        # A cada 50 pontos: velocidade aumenta, tempo de spawn diminui
        level = self.score // 50
        
        # O spawn rate nunca será menor que 500ms
        current_spawn_rate = max(500, INITIAL_ASTEROID_SPAWN_RATE - (level * 200))
        current_min_speed = INITIAL_ASTEROID_MIN_SPEED + (level * 0.5)
        current_max_speed = INITIAL_ASTEROID_MAX_SPEED + (level * 0.5)

        # Spawn de asteroides periodicamente
        now = pygame.time.get_ticks()
        if now - self.last_spawn > current_spawn_rate:
            self.last_spawn = now
            asteroid = Asteroid(current_min_speed, current_max_speed)
            self.all_sprites.add(asteroid)
            self.asteroids.add(asteroid)

        # Atualizar todos os sprites (movimento)
        self.all_sprites.update()

        # Checar Colisões: Tiro acerta Asteroide
        # groupcollide destrói ambos os sprites envolvidos se os dois últimos argumentos forem True
        hits = pygame.sprite.groupcollide(self.asteroids, self.bullets, True, True)
        for hit in hits:
            self.score += 10  # Aumenta a pontuação para cada asteroide destruído

        # Checar Colisões: Asteroide acerta a Nave
        hits = pygame.sprite.spritecollide(self.player, self.asteroids, False)
        if hits:
            self.game_over = True

        # Checar Condição: Asteroide chega ao fim da tela
        for asteroid in self.asteroids:
            if asteroid.rect.top >= HEIGHT:
                self.game_over = True

    def draw(self):
        # Preencher o fundo da tela com a cor preta
        self.screen.fill(BLACK)
        
        # Desenhar todos os sprites na tela
        self.all_sprites.draw(self.screen)
        
        # Desenhar a pontuação no canto superior esquerdo apenas se o jogo não estiver no fim
        if not self.game_over:
            self.draw_text(f"Pontos: {self.score}", self.font, WHITE, 10, 10)
        
        # Exibir mensagem de Game Over
        if self.game_over:
            # Criar um overlay escuro semitransparente
            overlay = pygame.Surface((WIDTH, HEIGHT))
            overlay.fill(BLACK)
            overlay.set_alpha(180)
            self.screen.blit(overlay, (0, 0))
            
            self.draw_text("GAME OVER", self.font, RED, WIDTH // 2 - 80, HEIGHT // 2 - 70)
            self.draw_text(f"Pontuação Final: {self.score}", self.font, YELLOW, WIDTH // 2 - 110, HEIGHT // 2 - 20)
            self.draw_text("Deseja jogar novamente?", self.font, WHITE, WIDTH // 2 - 145, HEIGHT // 2 + 30)
            self.draw_text("Pressione 'R' para reiniciar", self.font, GREEN, WIDTH // 2 - 160, HEIGHT // 2 + 70)
            
        # Atualizar o display
        pygame.display.flip()

    def draw_text(self, text, font, color, x, y):
        text_surface = font.render(text, True, color)
        self.screen.blit(text_surface, (x, y))

if __name__ == "__main__":
    game = Game()
