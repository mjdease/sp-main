﻿#pragma strict

private var game : Game;

private var gameDifficulty : List.<GameDifficulty> = List.<GameDifficulty>();
private var nextDif : List.<GameDifficulty> = List.<GameDifficulty>();
private var segmentCount : List.<int> = new List.<int>();

//Levels that are easy, medium and hard
private var easyLevels : int[] = [1,4,5,9];
private var mediumLevels : int[] = [6,8,3];
private var hardLevels : int[] = [2,7,10];
//Levels that have arleady been played
private var playedEasy : List.<int> = new List.<int>();
private var playedMedium : List.<int> = new List.<int>();
private var playedHard : List.<int> = new List.<int>();
//Level prediction difficulty
private var easy : List.<Difficulty> = new List.<Difficulty>();
private var medium : List.<Difficulty> = new List.<Difficulty>();
private var hard : List.<Difficulty> = new List.<Difficulty>();
private var expert : List.<Difficulty> = new List.<Difficulty>();

private var levelManager : LevelManager;

function Start () {
    game = GameObject.Find("/GameManager").GetComponent(GameSetupScript).game;
    levelManager = GameObject.Find("/GameScripts").GetComponent(LevelManager);

    for(var i : int = 0; i < game.getTeams().Count; i++){
        gameDifficulty.Add(GameDifficulty.Tutorial);
        nextDif.Add(GameDifficulty.Tutorial);
        segmentCount.Add(0);
    }
}

function getDifficulty(teamId : int) :GameDifficulty {
    return gameDifficulty[teamId];
}

function setDifficulty(teamId : int, diff : GameDifficulty){
    gameDifficulty[teamId] = diff;
}

function getSegmentCount(teamId : int) {
    return segmentCount[teamId];
}

function setSegmentCount(teamId : int, newCount : int) {
    segmentCount[teamId] = newCount;

    //After a certain amount of segment - change difficulty!
    if(segmentCount[teamId] == Config.EASY_DIFF_THRESHOLD) {
        gameDifficulty[teamId] = GameDifficulty.Easy;
    } else if(segmentCount[teamId] == Config.MEDIUM_DIFF_THRESHOLD) {
        gameDifficulty[teamId] = GameDifficulty.Medium;
    } else if(segmentCount[teamId] == Config.HARD_DIFF_THRESHOLD){
        gameDifficulty[teamId] = GameDifficulty.Hard;
    } else if(segmentCount[teamId] == Config.EXPERT_DIFF_THRESHOLD){
        gameDifficulty[teamId] = GameDifficulty.Expert;
    }
}

function getSegment(teamId : int) : int {
    var index : int = 0;
    var rand :int = 0;
    index = getIndex(teamId, levelManager.getCurrentLevel(teamId), levelManager.getPreviousLevel(teamId));
    return index;
}

function getIndex(teamId : int, current : int , previous: int) : int{

    var nextLevel : int = 0;
    var rand : int = 0;

    var currentDiff : GameDifficulty = GameDifficulty.Easy;
    var previousDiff : GameDifficulty = GameDifficulty.Easy;

    //Take the current and previous levels, and figure out what difficulty they are.
    if(inArray(current, easyLevels)){
        currentDiff = GameDifficulty.Easy;
    } else if(inArray(current, mediumLevels)){
        currentDiff = GameDifficulty.Medium;
    } else if(inArray(current, hardLevels)){
        currentDiff = GameDifficulty.Hard;
    }

    if(inArray(previous, easyLevels)){
        previousDiff = GameDifficulty.Easy;
    } else if(inArray(previous, mediumLevels)){
        previousDiff = GameDifficulty.Medium;
    } else if(inArray(previous, hardLevels)){
        previousDiff = GameDifficulty.Hard;
    }

    var tempDiffs : List.<GameDifficulty> = new List.<GameDifficulty>();
    var tempRand : int = 0;
    var i : int = 0;

    //Determine what should come next, by grabing a random segment that fits the order, ex. I'm Easy, I'm Easy too, oh okay let's grab a Medium.
    switch(getDifficulty(teamId)){
        case GameDifficulty.Tutorial:
            nextDif[teamId] = GameDifficulty.Easy;
        break;
        case GameDifficulty.Easy:
            for(var diff : Difficulty in easy){
                if(previousDiff == diff.previous && currentDiff == diff.current){
                    tempDiffs.Add(diff.next);
                }
            }
            if(tempDiffs.Count == 0){
                tempDiffs.Add(GameDifficulty.Easy);
            }
        break;
        case GameDifficulty.Medium:
            for(var diff : Difficulty in medium){
                if(previousDiff == diff.previous && currentDiff == diff.current){
                    tempDiffs.Add(diff.next);
                }
            }
            if(tempDiffs.Count == 0){
                tempDiffs.Add(GameDifficulty.Medium);
            }
        break;
        case GameDifficulty.Hard:
            for(var diff : Difficulty in hard){
                if(previousDiff == diff.previous && currentDiff == diff.current){
                    tempDiffs.Add(diff.next);
                }
            }
            if(tempDiffs.Count == 0){
                tempDiffs.Add(GameDifficulty.Medium);
            }
        break;
        case GameDifficulty.Expert:
            for(var diff : Difficulty in expert){
                if(previousDiff == diff.previous && currentDiff == diff.current){
                    tempDiffs.Add(diff.next);
                }
            }
            if(tempDiffs.Count == 0){
                tempDiffs.Add(GameDifficulty.Hard);
            }
        break;
    }

    if(getDifficulty(teamId) != GameDifficulty.Tutorial){
        tempRand = Random.Range(0, tempDiffs.Count);
        nextDif[teamId] = tempDiffs[tempRand];
    }
    //Check to see what levels have already been played, if all the levels have been played, we clear the list so we can do over and over again!
    checkCount(nextDif[teamId]);

    //Randomly pick a level based on the next difficulty - but only if we haven't played it yet!
    if(nextDif[teamId] == GameDifficulty.Easy){
        do{
            rand = Random.Range(0, easyLevels.length);
        } while (playedEasy.Contains(easyLevels[rand]));

        nextLevel = easyLevels[rand];
        playedEasy.Add(nextLevel);
    } else if(nextDif[teamId] == GameDifficulty.Medium){
        do{
            rand = Random.Range(0, mediumLevels.length);
        } while (playedMedium.Contains(mediumLevels[rand]));

        nextLevel = mediumLevels[rand];
        playedMedium.Add(nextLevel);
    } else if(nextDif[teamId] == GameDifficulty.Hard){
        do{
            rand = Random.Range(0, hardLevels.length);
        } while (playedHard.Contains(hardLevels[rand]));

        nextLevel = hardLevels[rand];
        playedHard.Add(nextLevel);
    }

    //Then we give you the level to play! Mwahahaha! Good luck :)
    return nextLevel;
}


function checkCount(nextDif: GameDifficulty) {
    switch(nextDif){
        case GameDifficulty.Easy:
            if(playedEasy.Count == easyLevels.length){
                playedEasy.Clear();
            }
        break;
        case GameDifficulty.Medium:
            if(playedMedium.Count == mediumLevels.length){
                playedMedium.Clear();
            }
        break;
        case GameDifficulty.Hard:
            if(playedHard.Count == hardLevels.length){
                playedHard.Clear();
            }

        break;
    }
}

function inArray(value : int, array : int[]) : boolean{
  for(var item : int in array) {
      if(value == item)
         return true;
   }
   return false;
}

/* That crazy level logic.

    Based on the current level, its previous level and the difficulty of the game,
    determine what level we should load next. Its great fun!
*/

easy.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Easy, GameDifficulty.Easy));
easy.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Easy, GameDifficulty.Easy));
easy.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Easy, GameDifficulty.Medium));
easy.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Medium, GameDifficulty.Easy));
easy.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Easy, GameDifficulty.Medium));
easy.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Easy, GameDifficulty.Easy));

medium.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Medium, GameDifficulty.Hard));
medium.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Easy, GameDifficulty.Medium));
medium.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Easy, GameDifficulty.Hard));
medium.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Medium, GameDifficulty.Easy));
medium.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Easy, GameDifficulty.Easy));
medium.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Hard, GameDifficulty.Easy));
medium.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Medium, GameDifficulty.Medium));
medium.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Easy, GameDifficulty.Easy));
medium.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Medium, GameDifficulty.Medium));
medium.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Medium, GameDifficulty.Easy));

hard.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Easy, GameDifficulty.Hard));
hard.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Medium, GameDifficulty.Easy));
hard.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Easy, GameDifficulty.Hard));
hard.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Hard, GameDifficulty.Easy));
hard.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Medium, GameDifficulty.Medium));
hard.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Medium, GameDifficulty.Easy));
hard.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Medium, GameDifficulty.Easy));
hard.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Medium, GameDifficulty.Medium));
hard.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Easy, GameDifficulty.Hard));

expert.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Easy, GameDifficulty.Hard));
expert.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Medium, GameDifficulty.Hard));
expert.Add(new Difficulty(GameDifficulty.Hard, GameDifficulty.Hard, GameDifficulty.Medium));
expert.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Easy, GameDifficulty.Hard));
expert.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Hard, GameDifficulty.Easy));
expert.Add(new Difficulty(GameDifficulty.Medium, GameDifficulty.Hard, GameDifficulty.Easy));
expert.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Hard, GameDifficulty.Easy));
expert.Add(new Difficulty(GameDifficulty.Easy, GameDifficulty.Medium, GameDifficulty.Hard));

