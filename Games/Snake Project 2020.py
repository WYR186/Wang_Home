print("Snake!,try to fill up the screen with the snake's body")
print("Grow by eating apple")
input("Press Enter to continue...")
    
import pygame, sys, random, time
from pygame.locals import *

##parameters 

def main():
    global FPSCLOCK, DISPLAY, BASICFONT, Grey, Red, White, Black

    pygame.init()

    (width, height) = 640, 480

    DISPLAY = pygame.display.set_mode((width, height))

    pygame.display.set_caption('Snake!')
    FPSCLOCK= pygame.time.Clock()
    BASICFONT=pygame.font.SysFont("SIMYOU.TTF",80)
    ##control          
    ##Background
    Black = pygame.Color(0,0,0)
    White = pygame.Color(255,255,255)
    Red = pygame.Color(255,0,0)
    Grey = pygame.Color(150,150,150)
                
    playGame()

##BASIC CONTROL
def playGame():
    
    ##Initial Snake
    snake_head = [100,100]
    snake_length = [[80,100],[60,100],[40,100]]
    direction = 'rigth'

    ##Initial food
    food_position = [300,300]
    food_remain = 1 ##when=0, food is eaten; 1 is not eaten
    
    UP = 'up'
    DOWN = 'down'
    LEFT = 'left'
    RIGHT = 'right'

    ##Main loop
    while True:
        ## detact keyboard wasd
        for event in pygame.event.get():
            if event.type == QUIT:
                ##Quit when commanded
                pygame.quit()
                sys.exit()
                
            ##tramslate key boards, wasd and arrow keys to control.   
            elif event.type == KEYDOWN:
                if (event.key == K_UP or event.key == K_w) and direction != DOWN:
                    direction = UP
                if (event.key == K_DOWN or event.key == K_s) and direction != UP:
                    direction = DOWN
                if (event.key == K_LEFT or event.key == K_a) and direction != RIGHT:
                    direction = LEFT
                if (event.key == K_RIGHT or event.key == K_d) and direction != LEFT:
                    direction = RIGHT
                
        ##Snake movement (head turning)
        if direction == LEFT:
            snake_head[0] -= 20
        if direction == RIGHT:
            snake_head[0] += 20
        if direction == UP:
            snake_head[1] -= 20
        if direction == DOWN:
            snake_head[1] += 20

        ##Add length to body
        snake_length.insert(0, list(snake_head))
        
        ##evualute food is eaten or not
        if snake_head[0]==food_position[0] and snake_head[1]==food_position[1]:
            food_flag = 0
        else:
            snake_length.pop()

        ##New Food
        if food_remain == 0:
            x = random.randrange(1,32)
            y = random.randrange(1,24)
            food_position = [int(x*20),int(y*20)]
            food_remain = 1
            

        DISPLAY.fill(Black)
        drawSnake(snake_length)
        drawFood(food_position)
        drawScore(len(snake_length) - 3)
        ##Pygame refresh 
        pygame.display.flip()
        ##控制游戏速度
        FPSCLOCK.tick(7)

        ##decided when to end
        if snake_head[0]<0 or snake_head[0]>620:
            GameOver()
        if snake_head[1]<0 or snake_head[1]>460:
            GameOver()
        for i in snake_length[1:]:
            if snake_head[0]==i[0] and snake_head[1]==i[1]:
                GameOver()

##Draw Snake
def drawSnake(snake_length):
    for i in snake_length:
        pygame.draw.rect(DISPLAY,White, Rect(i[0], i[1], 20, 20))
        
## Food Position
def drawFood(food_position):
    pygame.draw.rect(DISPLAY, Red, Rect(food_position[0], food_position[1], 20, 20))


##Print Score
def drawScore(score):
    # color cited from "Source 3"
    score_Surf = BASICFONT.render('%s' %(score), True, Grey)
    # position
    score_Rect = score_Surf.get_rect()
    score_Rect.midtop = (320, 240)
    # 绑定以上设置到句柄
    DISPLAY.blit(score_Surf, score_Rect)
        
    # when snake hits wall
    if snake_head[0]<0 or snake_head[0]>620:
        GameOver()
    if snake_head[1]<0 or snake_head[1]>460:
        GameOver()
    # when snake hititself
    for i in snake_length[1:]:
        if snake_head[0]==i[0] and snake_head[1]==i[1]:
            GameOver()


## What the Snake looks like
def drawSnake(snake_length):
    for i in snake_length:
        pygame.draw.rect(DISPLAY, White, Rect(i[0], i[1], 20, 20))

## Food position
def drawFood(food_position):
    pygame.draw.rect(DISPLAY, Red, Rect(food_position[0], food_position[1], 20, 20))

##  score
def drawScore(score):
    ## score color
    score_Surf = BASICFONT.render('%s' %(score), True, Grey)
    # score position
    score_Rect = score_Surf.get_rect()
    score_Rect.midtop = (550, 80)
    # 绑定以上设置到句柄
    DISPLAY.blit(score_Surf, score_Rect)

# Game Over and auto quit
def GameOver():
    # color
    GameOver_Surf = BASICFONT.render('Game Over!', True, Grey)
    # position
    GameOver_Rect = GameOver_Surf.get_rect()
    GameOver_Rect.midtop = (320, 10)
    # 绑定以上设置到句柄
    DISPLAY.blit(GameOver_Surf, GameOver_Rect)

    pygame.display.flip()
    # wait 3 seconds
    time.sleep(3)
    # quit game
    pygame.quit()
    # quit 
    sys.exit()


if __name__ == "__main__":
    main()



