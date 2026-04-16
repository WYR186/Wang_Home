//Version 1.9

#include "game.h"
//This code implements a simplified version of the 2048 game. It includes core functions 
//to initialize (make_game()), reset (remake_game()), and manage tile movements (move_w, move_s, move_a, move_d).
//Blocks merge when they collide, and legal_move_check() ensures valid moves are still available. 
//Finally, the game loops through player inputs to process turns, update the score, and handle game termination.

game * make_game(int rows, int cols)
/*! Create an instance of a game structure with the given number of rows
    and columns, initializing elements to -1 and return a pointer
    to it. (See game.h for the specification for the game data structure) 
    The needed memory should be dynamically allocated with the malloc family
    of functions.
*/
{
    //Dynamically allocate memory for game and cells (DO NOT modify this)
    game * mygame = malloc(sizeof(game));
    mygame->cells = malloc(rows*cols*sizeof(cell));

    //YOUR CODE STARTS HERE:  Initialize all other variables in game struct
    mygame->rows=rows;//initilaize rows
    mygame->cols=cols;//initilize cols
    mygame->score=0;//initilize score

    //initilize every cells to -1
    int i,j;
    for(i=0;i<rows*cols;i++){ //loop thorugh the 1D array
        mygame->cells[i]=-1;
    }

    return mygame;
}

void remake_game(game ** _cur_game_ptr,int new_rows,int new_cols)
/*! Given a game structure that is passed by reference, change the
	game structure to have the given number of rows and columns. Initialize
	the score and all elements in the cells to -1. Make sure that any 
	memory previously allocated is not lost in this function.	
*/
{
	/*Frees dynamically allocated memory used by cells in previous game,
	 then dynamically allocates memory for cells in new game.  DO NOT MODIFY.*/
	free((*_cur_game_ptr)->cells);
	(*_cur_game_ptr)->cells = malloc(new_rows*new_cols*sizeof(cell));

	 //YOUR CODE STARTS HERE:  Re-initialize all other variables in game struct
         //YOUR CODE STARTS HERE:  Initialize all other variables in game struct
    (*_cur_game_ptr)->rows=new_rows;//initilaize rows
    (*_cur_game_ptr)->cols=new_cols;//initilize cols
    (*_cur_game_ptr)->score=0;//initilize score

    //initilize every cells to -1
    int i,j;
    for(i=0;i<new_rows*new_cols;i++){ //loop thorugh the 1D array
        (*_cur_game_ptr)->cells[i]=-1;
    }


	return;	
}

void destroy_game(game * cur_game)
/*! Deallocate any memory acquired with malloc associated with the given game instance.
    This includes any substructures the game data structure contains. Do not modify this function.*/
{
    free(cur_game->cells);
    free(cur_game);
    cur_game = NULL;
    return;
}

cell * get_cell(game * cur_game, int row, int col)
/*! Given a game, a row, and a column, return a pointer to the corresponding
    cell on the game. (See game.h for game data structure specification)
    This function should be handy for accessing game cells. Return NULL
	if the row and col coordinates do not exist.
*/
{
    //YOUR CODE STARTS HERE
    if (row >= 0 && row<cur_game->rows&&col>=0&&col<cur_game->cols){
        return cur_game->cells+(cur_game->cols*row+col); //if valid, then hand over
    }
        return NULL;  // if not valid, reutnr NULL
}

int move_w(game * cur_game)
/*!Slides all of the tiles in cur_game upwards. If a tile matches with the 
   one above it, the tiles are merged by adding their values together. When
   tiles merge, increase the score by the value of the new tile. A tile can 
   not merge twice in one turn. If sliding the tiles up does not cause any 
   cell to change value, w is an invalid move and return 0. Otherwise, return 1. 
*/
{
    //YOUR CODE STARTS HERE
    int i,j,k;//row, col
    int current;
    int moved = 0;//prepare what to return
    int top;//target postition to move
    int combined_row;//merge only once!
    
    
    //set up record for merging times, make sure not merge twice in one turn
    for(j=0;j<cur_game->cols;j++){
        top=0;//initilize the target location for currerent number
        combined_row=-1;//set up record for merging times, make sure not merge twice in one turn
    


    //check if the top block have the same value and combine if valid
    for(i=0;i<cur_game->rows;i++){
        current = *(get_cell(cur_game,i,j));
        if(current !=-1){
            // Check if the tile can be merged with the one directly above it
            if(top > 0 && *get_cell(cur_game, top - 1, j) == current && combined_row != top - 1) {
                    *get_cell(cur_game, top - 1, j) *= 2;//combine current and top blocks
                    cur_game->score += *get_cell(cur_game, top - 1, j);  //update score
                    *get_cell(cur_game, i, j) = -1;// Clear the current cell after merging.
                    combined_row = top - 1;  //update latest combined row location
                    moved = 1;//indicate this row have been moved
            }
            else{
                if(i!=top){
                    *get_cell(cur_game,top,j)=current;//move current block location to targeted location
                    *get_cell(cur_game,i,j)=-1;//clear the original position.
                    moved=1;
                }
                    top++;
                }   
            }
        }
    }
        return moved;
};

int move_s(game * cur_game) //slide down
{
    //YOUR CODE STARTS HERE
    //YOUR CODE STARTS HERE
    int i,j,k;//row, col
    int current;
    int moved = 0;//prepare what to return
    int bottom;//target postition to move
    int combined_row;//merge only once!
    
    
    //set up record for merging times, make sure not merge twice in one turn
    for(j=0;j<cur_game->cols;j++){
        bottom=cur_game->rows-1;//initilize the target location for currerent number
        combined_row=-1;//set up record for merging times, make sure not merge twice in one turn
    


    //check if the bottom block have the same value and combine if valid
    for(i=cur_game->rows-1;i>=0;i--){
        current = *(get_cell(cur_game,i,j));
        if(current !=-1){
            // Check if the tile can be merged with the one directly above it
            if(bottom<cur_game->rows-1&&*get_cell(cur_game,bottom+1,j)==current&&combined_row!=bottom+1) {
                    *get_cell(cur_game, bottom + 1, j) *= 2;//combine current and bottom blocks
                    cur_game->score += *get_cell(cur_game, bottom + 1, j);  //update score
                    *get_cell(cur_game, i, j) = -1;// Clear the current cell after merging.
                    combined_row = bottom + 1;  //update latest combined row location
                    moved = 1;//indicate this row have been moved
            }
            else{
                if(i!=bottom){
                    *get_cell(cur_game,bottom,j)=current;//move current block location to targeted location
                    *get_cell(cur_game,i,j)=-1;//clear the original position.
                    moved=1;
                }
                    bottom--;
                }   
            }
        }
    }
        return moved;
};

int move_a(game * cur_game) //slide left
{
    //YOUR CODE STARTS HERE
{
    int i, j; // row, col
    int current;
    int moved = 0; // prepare what to return, indicating whether a move happened
    int left; // target position to move the tile
    int combined_col; // ensure merging only happens once per column

        // Loop through each row
        for (i = 0; i < cur_game->rows; i++) {
            left = 0; // initialize the target position for the current number (starting from the left)
            combined_col = -1; // initialize to ensure no merge happens more than once in a column

            // Traverse the row from left to right
            for (j = 0; j < cur_game->cols; j++) {
                current = *(get_cell(cur_game, i, j)); // get the current tile

                if (current != -1) { // if the current tile is not empty
                    // Check if the tile can be merged with the one directly to the left
                    if (left > 0 && *get_cell(cur_game, i, left - 1) == current && combined_col != left - 1) {
                        *get_cell(cur_game, i, left - 1) *= 2; // combine current and left blocks
                        cur_game->score += *get_cell(cur_game, i, left - 1); // update score
                        *get_cell(cur_game, i, j) = -1; // clear the current cell after merging
                        combined_col = left - 1; // update the column where merging happened
                        moved = 1; // indicate that a move has been made
                    } else {
                        // Otherwise, move the current block left to the target position
                        if (j != left) {
                            *get_cell(cur_game, i, left) = current; // move the current block to the target position
                            *get_cell(cur_game, i, j) = -1; // clear the original position
                            moved = 1;
                        }
                        left++; // move the target position rightwards for the next tile
                    }
                }
            }
        }
        return moved;
    };
}

int move_d(game * cur_game){ //slide to the right
    //YOUR CODE STARTS HERE
{
    int i, j;  //row, col
    int current;
    int moved = 0;  //prepare to return whether a move happened
    int right;  //target position to move the tile
    int combined_col;  //ensure merging only happens once per row

    // Traverse each row
    for (i = 0; i < cur_game->rows; i++) {
        right = cur_game->cols - 1;  //initialize the target position for the current number
        combined_col = -1;  //initialize to ensure no merge happens more than once in a row

        // Traverse the row from right to left
        for (j = cur_game->cols - 1; j >= 0; j--) {  //descending loop to move tiles to the right
            current = *(get_cell(cur_game, i, j));  //get the current tile

            if (current != -1) {  //if the current tile is not empty
                //Check if the tile can be merged with the one directly to the right
                if (right < cur_game->cols - 1 && *get_cell(cur_game, i, right + 1) == current && combined_col != right + 1) {
                    *get_cell(cur_game, i, right + 1) *= 2;  //combine current and right blocks
                    cur_game->score += *get_cell(cur_game, i, right + 1);  // update score
                    *get_cell(cur_game, i, j) = -1;  //clear the current cell after merging
                    combined_col = right + 1;  //update latest combined column location
                    moved = 1;  //indicate this row has been moved
                } else {
                    if (j != right) {
                        *get_cell(cur_game, i, right) = current;  //move current block to the target location
                        *get_cell(cur_game, i, j) = -1;  //clear the original position
                        moved = 1;
                    }
                    right--;  //move the target position to the left for the next tile
                }
            }
        }
    }

    return moved;  //return whether any tiles were moved
}
}

int legal_move_check(game * cur_game)
/*! Given the current game check if there are any legal moves on the board. There are
    no legal moves if sliding in any direction will not cause the game to change.
	Return 1 if there are possible legal moves, 0 if there are none.
 */
{
    //YOUR CODE STARTS HERE
    // Traverse the board
    for (int i = 0; i < cur_game->rows; i++) {
        for (int j = 0; j < cur_game->cols; j++) {
            int current = *get_cell(cur_game, i, j);

            if (current == -1) {//Check for empty cell
                return 1;  // Legal move exists if there's an empty cell
            }
            if (j < cur_game->cols - 1 && current == *get_cell(cur_game, i, j + 1)) {//Check for possible merges
                return 1;  // Horizontal merge possible
            }
            if (i < cur_game->rows - 1 && current == *get_cell(cur_game, i + 1, j)) {
                return 1;  // Vertical merge possible
            }
        }
    }

    // No legal moves left
    return 0;
}



/*! code below is provided and should not be changed */

void rand_new_tile(game * cur_game)
/*! insert a new tile into a random empty cell. First call rand()%(rows*cols) to get a random value between 0 and (rows*cols)-1.
*/
{
	
	cell * cell_ptr;
    cell_ptr = 	cur_game->cells;
	
    if (cell_ptr == NULL){ 	
        printf("Bad Cell Pointer.\n");
        exit(0);
    }
	
	
	//check for an empty cell
	int emptycheck = 0;
	int i;
	
	for(i = 0; i < ((cur_game->rows)*(cur_game->cols)); i++){
		if ((*cell_ptr) == -1){
				emptycheck = 1;
				break;
		}		
        cell_ptr += 1;
	}
	if (emptycheck == 0){
		printf("Error: Trying to insert into no a board with no empty cell. The function rand_new_tile() should only be called after tiles have succesfully moved, meaning there should be at least 1 open spot.\n");
		exit(0);
	}
	
    int ind,row,col;
	int num;
    do{
		ind = rand()%((cur_game->rows)*(cur_game->cols));
		col = ind%(cur_game->cols);
		row = ind/cur_game->cols;
    } while ( *get_cell(cur_game, row, col) != -1);
        //*get_cell(cur_game, row, col) = 2;
	num = rand()%20;
	if(num <= 1){
		*get_cell(cur_game, row, col) = 4; // 1/10th chance
	}
	else{
		*get_cell(cur_game, row, col) = 2;// 9/10th chance
	}
}

int print_game(game * cur_game) 
{
    cell * cell_ptr;
    cell_ptr = 	cur_game->cells;

    int rows = cur_game->rows;
    int cols = cur_game->cols;
    int i,j;
	
	printf("\n\n\nscore:%d\n",cur_game->score); 
	
	
	printf("\u2554"); // topleft box char
	for(i = 0; i < cols*5;i++)
		printf("\u2550"); // top box char
	printf("\u2557\n"); //top right char 
	
	
    for(i = 0; i < rows; i++){
		printf("\u2551"); // side box char
        for(j = 0; j < cols; j++){
            if ((*cell_ptr) == -1 ) { //print asterisks
                printf(" **  "); 
            }
            else {
                switch( *cell_ptr ){ //print colored text
                    case 2:
                        printf("\x1b[1;31m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 4:
                        printf("\x1b[1;32m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 8:
                        printf("\x1b[1;33m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 16:
                        printf("\x1b[1;34m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 32:
                        printf("\x1b[1;35m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 64:
                        printf("\x1b[1;36m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 128:
                        printf("\x1b[31m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 256:
                        printf("\x1b[32m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 512:
                        printf("\x1b[33m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 1024:
                        printf("\x1b[34m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 2048:
                        printf("\x1b[35m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 4096:
                        printf("\x1b[36m%04d\x1b[0m ",(*cell_ptr));
                        break;
                    case 8192:
                        printf("\x1b[31m%04d\x1b[0m ",(*cell_ptr));
                        break;
					default:
						printf("  X  ");

                }

            }
            cell_ptr++;
        }
	printf("\u2551\n"); //print right wall and newline
    }
	
	printf("\u255A"); // print bottom left char
	for(i = 0; i < cols*5;i++)
		printf("\u2550"); // bottom char
	printf("\u255D\n"); //bottom right char
	
    return 0;
}

int process_turn(const char input_char, game* cur_game) //returns 1 if legal move is possible after input is processed
{ 
	int rows,cols;
	char buf[200];
	char garbage[2];
    int move_success = 0;
	
    switch ( input_char ) {
    case 'w':
        move_success = move_w(cur_game);
        break;
    case 'a':
        move_success = move_a(cur_game);
        break;
    case 's':
        move_success = move_s(cur_game);
        break;
    case 'd':
        move_success = move_d(cur_game);
        break;
    case 'q':
        destroy_game(cur_game);
        printf("\nQuitting..\n");
        return 0;
        break;
	case 'n':
		//get row and col input for new game
		dim_prompt: printf("NEW GAME: Enter dimensions (rows columns):");
		while (NULL == fgets(buf,200,stdin)) {
			printf("\nProgram Terminated.\n");
			return 0;
		}
		
		if (2 != sscanf(buf,"%d%d%1s",&rows,&cols,garbage) ||
		rows < 0 || cols < 0){
			printf("Invalid dimensions.\n");
			goto dim_prompt;
		} 
		
		remake_game(&cur_game,rows,cols);
		
		move_success = 1;
		
    default: //any other input
        printf("Invalid Input. Valid inputs are: w, a, s, d, q, n.\n");
    }

	
	
	
    if(move_success == 1){ //if movement happened, insert new tile and print the game.
         rand_new_tile(cur_game); 
		 print_game(cur_game);
    } 

    if( legal_move_check(cur_game) == 0){  //check if the newly spawned tile results in game over.
        printf("Game Over!\n");
        return 0;
    }
    return 1;
}
