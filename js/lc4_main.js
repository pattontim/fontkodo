/* Provides key functions to modify and generate the ciphertext
 * Translated from C code
*/

let board = [[]];

let marker = {
  'x':0,
  'y':0
};

let boardStr = "#_23456789abcdefghijklmnopqrstuvwxyz";
const NONCE_SIZE = 6, SIGNATURE_SIZE=10, HEADER_SIZE = 16;
let boardIndex = boardStr.split('');

// -------------------- Model ------------------------------
function processSequence(key, sequence, signature="", header="", mode=''){
  let retSeq = [sequence.length];
  let nonce = [NONCE_SIZE];
  switch(mode){
    case 'e':
    case 'd':
      let i = 0;
      //determine if request originated from sign/unsign
      if(signature.length == 0){
        setState(key, "", "");
      }
      while(i < sequence.length){
        val = processLetter(sequence[i], mode);
        sequence[i] = val;
        i++;
      }
      i = 0;
      while(i < signature.length){
        val = processLetter(signature[i], mode);
        signature[i] = val;
        i++;
      }
      break;
    case 's':
      j = 0;
      let buf = [];
      nonce = "abcdef";
      nonce = nonce.split('');

      for(let j = 0; j < 6; j++){
        //0 to 35 inclusive
        //nonce.push(boardIndex[Math.floor(Math.random() * 36)]);
      }
      console.log(nonce);
      setState(key, nonce, header);

      processSequence(key, sequence, signature, header, 'e');

      //sanitize output
      buf = sequence.slice(0);
      j = 0;
      while(j < NONCE_SIZE){
        sequence[j] = nonce[j];
        j++;
      }
      while(j < NONCE_SIZE+buf.length){
        sequence[j] = buf[j-NONCE_SIZE];
        j++;
      }
      break;

    case 'u':
      let sigOffset = sequence.length-SIGNATURE_SIZE;
      let s_buf = [sigOffset-NONCE_SIZE+1]
      nonce = [NONCE_SIZE];
      let k = 0;

      //extract nonce
      while(k < NONCE_SIZE){
        nonce[k] = sequence[k];
        k++;
      }

      //according to presence of extracted nonce and header
      setState(key, nonce, header);

      //extract sequence
      while(k < sigOffset){
        s_buf[k-NONCE_SIZE] = sequence[k];
        k++;
      }

      //extract signature
      while(k < sequence.length){
        signature[k-sigOffset] = sequence[k];
        k++;
      }

      //assigns without changing pointer, for return
      let sequenceTemp = s_buf.slice(0);
      for(let i = 0; i < sequenceTemp.length; i++){
        sequence[i] = sequenceTemp[i];
      }
      //shorten array
      sequence.length = s_buf.length;

      processSequence(key, sequence, signature, header, 'd');

      break;
    default:
  }
}

function processLetter(pl, mode){
  let plain = {}, cipher = {};

  let markVal = boardIndex.indexOf(board[marker.x][marker.y]);
  // console.log("marker value: " + markVal);
  let markIncX = markVal%6;
  let markIncY = Math.floor(markVal/6);

  //use plain to get enc
  if(mode == 'e'){
    //find in array, set plainX and plainY to loc in array where pl is found
    plain = getCharLocation(pl);
    // console.log("plain location: x: " + plain.x + " y:", plain.y + " mark inc x: " + markIncX + " mark inc y: " + markIncY);
    cipher.x = (plain.x + markIncX)%6;
    cipher.y = (plain.y + markIncY)%6;
    // console.log("cipher location: x: " + cipher.x + " y:", cipher.y + " mark inc x: " + markIncX + " mark inc y: " + markIncY);
    ret = board[cipher.x][cipher.y];
    //use enc to get plain
  } else {
    //sets cipher x and y
    console.log("getting char loc of char: " + pl);
    cipher = getCharLocation(pl);
    if(cipher==undefined){
      return;
    }
    plain.x = (cipher.x + (-markIncX))%6;
    plain.y = (cipher.y + (-markIncY))%6;

    //handle modulo negative remainder behaviour
    plain.x = (plain.x < 0) ? 6 - Math.abs(plain.x): plain.x;
    plain.y = (plain.y < 0) ? 6 - Math.abs(plain.y): plain.y;
    ret = board[plain.x][plain.y];
  }

  let ciphVal = boardIndex.indexOf(board[cipher.x][cipher.y]);
  let ciphIncX = ciphVal%6;
  let ciphIncY = Math.floor(ciphVal/6);

  //according to algorithm, Y for row start, X for col start
  shiftRow(plain.y);``

  //prevent row shift from misaligning stored cipher location
  if(cipher.y == plain.y){
    cipher.x = (cipher.x+1)%6;
  }
  shiftCol(cipher.x);

  //wrap around marker
  marker.x = (marker.x + ciphIncX)%6;
  marker.y = (marker.y + ciphIncY)%6;

  return ret;
}

function getCharLocation(plain){
  for(let i = 0; i < 6; i++){
    if(board[i].indexOf(plain) != -1){
      let retVal = {};
      retVal.x = i;
      retVal.y = board[i].indexOf(plain);
      return retVal;
    }
  }
}

function shiftRow(row){
  if(marker.y == row)
    marker.x = (marker.x+1)%6;

  let move = board[5][row];
  for(let i = 5; i > 0; i--){
    board[i][row] = board[i-1][row];
  }
  board[0][row] = move;
}
//
function shiftCol(col){
  if(marker.x == col)
    marker.y = (marker.y+1)%6;

  let move = board[col][5];
  for(let i = 5; i > 0; i--){
    board[col][i] = board[col][i-1];
  }
  board[col][0] = move;
}

function setState(key, nonce, header){
  marker.x = 0;
  marker.y = 0;
  board=[];
  //init board
  for(let i = 0; i < 6; i++){
    board.push(new Array());
    for(let j = 0; j < 6; j++){
      board[i].push(key[j*6 + i]);
    }
  }
  let n = nonce.length;
  for(let i = 0; i < n; i++){
    processLetter(nonce[i], 'e');
  }
  let h = header.length;
  for(let i = 0; i < h; i++){
    //printf("processing header\n");
    processLetter(header[i], 'e');
  }
}

function generateKey(){
  let i = 35;
  let rand = 0;
  let cpyKey = [];
  cpyKey = boardStr.split('').slice();
  let genKey = [];

  // Implements the Fisher–Yates shuffle to generate a permutation
  while(i > 0){
    rand = Math.floor(Math.random() * cpyKey.length);
    genKey.push(cpyKey.splice(rand,1).toString());
    i--;
  }
  return keyGen;
}

generateKey();

//-------------------- Controller -------------------------------
document.getElementById("encryptBtn").addEventListener("click", encrypt);
document.getElementById("decryptBtn").addEventListener("click", decrypt);

function encrypt(){
    let key = document.getElementById('key_field').value;
    let sequence = document.getElementById('seq_field').value.split('');
    let signature= document.getElementById('sig_field').value.split('');
    let header = document.getElementById('header_field').value;
    console.log(signature);
    console.log(header);
    if(header != 0 || signature != 0){
      processSequence(key, sequence, signature, header, 's');
    } else {
      processSequence(key, sequence, "", "", 'e');
    }
    console.log(encrypt.caller);
    // processSequence(key, sequence, "", "", 'e');
    document.getElementById('seq_field').value = sequence.join('')+signature.join('');
}

function decrypt(){
  let key = document.getElementById('key_field').value;
  let sequence = document.getElementById('seq_field').value.split('');
  let signature= document.getElementById('sig_field').value.split('');
  let header = document.getElementById('header_field').value;
  if(header != 0){
    processSequence(key, sequence, signature, header, 'u');
  } else {
    processSequence(key, sequence, "", "", 'd');
  }
  // processSequence(key, sequence, "", "", 'e');
  document.getElementById('seq_field').value = sequence.join('');
  document.getElementById('sig_field').value = signature.join('');
}

/* JS functionality tests

void printState(char * pt, char * ct){
	for(int i = 0; i < 6; i++){
		for(int j = 0; j < 6; j++){
			printf("%c", board[j][i]);
		}
		printf("\n");
	}
	printf("m: (%d,%d)", mark.x, mark.y);
	printf("pt: %c ", *pt);
	printf("ct: %c\n", *ct);
}

encryption
let key = "7dju4s_in6vkecxorlzftgq358mhy29pw#ba";
let sequence = "the_swallow_flies_at_midnight";
signature = "";

decryption
let key = "9mlpg_to2yxuzh4387dsajknf56bi#ecwrqv";
let sequence = "grrhkajlmd3c6xkw65m3dnwl65n9op6k_o59qeq";
signature = "";

signing
let key = "xv7ydq#opaj_39rzut8b45wcsgehmiknf26l";
let sequence = "im_about_to_put_the_hammer_down";
let signature = "lrubberduc";
with header
let header = "abcdefgh23456789";

//unsigning
let key = "xv7ydq#opaj_39rzut8b45wcsgehmiknf26l";
let signature = "lrubberduc";
let header = "abcdefgh23456789";
let sequence = "35q6wghr7ikwu_q9qib_744exjcv_mkrcemynetk4bvjqgd";

sequence = sequence.split('');
signature = signature.split('');

processSequence(key, sequence, signature, header, 's');
console.log(sequence.join('')+signature.join(''));*/
