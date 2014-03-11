﻿#pragma strict

public var spawns : List.<Transform>;
public var tutorialPoints : List.<Transform>;
public var coins : List.<Transform>;

// TODO - use real difficulty.
private var diff : int = 0;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    var player : Player = GameObject.Find("/GameManager").GetComponent(PlayerScript).getSelf();

    var enemies : List.<Enemy> = new List.<Enemy>();
    var points : Dictionary.<int, Transform> = new Dictionary.<int, Transform>();
    var prefabs : Dictionary.<int, int> = new Dictionary.<int, int>();
    for(var i : int = 0; i < spawns.Count; i++){
        var point : Transform = spawns[i];
        // parts array contains [garbage, pairId, enemyType, start/end, difficulty]
        var parts : String[] = point.name.Split("_"[0]);

        if(int.Parse(parts[4]) <= diff){
            var pair : int = int.Parse(parts[1]);
            points.Add(pair * 2 + int.Parse(parts[3]), point);
            if(!prefabs.ContainsKey(pair)){
                prefabs.Add(pair, int.Parse(parts[2]));
            }
        }
    }
    for(var key : int in prefabs.Keys){
        enemies.Add(new Enemy(points[key*2], points[key*2+1], prefabs[key]));
    }

    // TODO - only show signs appropriate for player role
    var signs : List.<GameObject> = GameObject.Find("/GameScripts").GetComponent(LevelManager).signPrefabs;

    if(player.GetType() == Runner){
        Debug.Log("Show Runner Signs");

    } else if(player.GetType() == Commander){
             Debug.Log("Show Commander Signs");
    }


    for(var k : int = 0; k < tutorialPoints.Count; k++){
        var locator : Transform = tutorialPoints[k];
        var signIndex : int = int.Parse(locator.name.Split("_"[0])[1]);
        Instantiate(signs[signIndex], locator.position, Quaternion.identity);
    }

    if(Network.isServer){
        GameObject.Find("GameScripts").GetComponent(LevelManager).onAddSegment(gameObject, enemies, coins);
    }
}
