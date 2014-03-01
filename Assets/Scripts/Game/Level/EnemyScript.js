﻿#pragma strict

public var type : EnemyType;

private var game : Game;
private var model : GameObject;
private var animator : Animator;

private var speed : float;
private var distance : float;
private var alive : boolean;
private var startTime : float;
private var start : Vector3;
private var end : Vector3;
private var idle : boolean = false;

function OnNetworkInstantiate (info : NetworkMessageInfo) {
    alive = true;
    game = GameObject.Find("/GameManager").GetComponent(GameSetupScript).game;

    model = gameObject.transform.Find("model").gameObject;
    animator = model.GetComponent(Animator);
}

function init(pt1 : Vector3, pt2 : Vector3){
    // TODO adjust based on difficulty
    speed  = Random.Range(0.0, 0.2) + Config.ENEMY_SPEED;
    start = pt1;
    end = pt2;
    distance = Vector3.Distance(pt1, pt2);
    if((type == EnemyType.Cardinal) || (type == EnemyType.Worm)){
        idle = true;
    }
}

function Update(){
    // TODO - remove animator check when debug enemies are removed
    if(animator){
        var animState : AnimatorStateInfo = animator.GetCurrentAnimatorStateInfo(0);
        if(animState.IsName("Base Layer.Death") && !animator.IsInTransition(0)){
            Util.Toggle(gameObject, false);
        }
        if(animState.IsName("Base Layer.Attack") && !animator.IsInTransition(0)){
            animator.SetBool("attack", false);
        }
    }
    if(!networkView.isMine || game.getState() != GameState.Playing){
        return;
    }
    if(type == EnemyType.Cardinal){
        // FIXME add support for two teams
        if(idle && end.x - game.getTeam(0).getLeader().getPosition().x < Config.CARDINAL_TRIGGER_DISTANCE){
            idle = false;
            startTime = Time.time;
        }
        if(!idle){
            var progress : float = ((Time.time - startTime) * speed)/distance;
            transform.position = Vector3.Lerp(start, end, progress);
            if(progress > 0.99){
                notifyKill();
            }
        }
    }
    else if(type == EnemyType.Worm){
        // TODO toggle between attack and idle at regular intervals
    }
    else if(speed){
        var pt : float = Mathf.PingPong(Time.time * speed, 1);
        var newPosition : Vector3 = Vector3.Lerp(start, end, pt);
        transform.rotation.y = (newPosition.x - transform.position.x > 0) ? 0 : 180;
        transform.position = newPosition;
    }
}

function isAlive(){
    return alive;
}

function notifyKill(){
    if(alive){
        if(Network.isServer){
            kill();
        }
        else{
            networkView.RPC("kill", RPCMode.Server);
        }
    }
}

@RPC
function kill(){
    syncKill();
    networkView.RPC("syncKill", RPCMode.OthersBuffered);
}

@RPC
function syncKill(){
    alive = false;
    animator.SetBool("death", true);
}

function notifyAttack(){
    if(alive){
        if(Network.isServer){
            attack();
        }
        else{
            networkView.RPC("attack", RPCMode.Server);
        }
    }
}

@RPC
function attack(){
    syncAttack();
    networkView.RPC("syncAttack", RPCMode.Others);
}

@RPC
function syncAttack(){
    animator.SetBool("attack", true);
}
