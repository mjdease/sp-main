﻿#pragma strict

var menuSkin : GUISkin;

private var menuScript : Menu;
private var playerScript : PlayerScript;

private var showMenu : boolean = false;

private var playerName : String;
private var newName : String = "";
private var backgroundTexutre : Texture2D;
private var startBtnTexture : Texture2D;
private var headerText = 270;
private var bodyText = 60;
private var keyboard : TouchScreenKeyboard;
private var iskBoardOpen : boolean = false;
private var kBoardString : String;
var mainmenu : MainMenu;

function Start(){
    menuScript = Menu.script;
    playerScript = menuScript.playerScript;
    playerName = playerScript.getName();
    backgroundTexutre = Resources.Load("Textures/gui/background", Texture2D);
    startBtnTexture = Resources.Load("Textures/gui/startBtn", Texture2D);
    menuSkin = Resources.Load("MenuSkin", GUISkin);

}


function OnGUI (){
    if(!showMenu){
        return;
    }
    GUI.skin = menuSkin;

    GUI.DrawTexture(new Rect(0,0, Screen.width, Screen.height), backgroundTexutre);

    var labelStyle : GUIStyle = GUI.skin.GetStyle("Logo");
    labelStyle.fontSize = menuScript.getScale() * headerText;
    GUI.Label (new Rect (0, Screen.height/2 - Screen.height/8 , Screen.width, 0), "Scrambled", "Logo");

    var localStyle : GUIStyle = GUI.skin.GetStyle("PlainText");
    localStyle.fontSize = menuScript.getScale() * bodyText;

    if(playerName){
        GUI.Label(Rect(0,0, Screen.width, Screen.height + 60 ), "Welcome back, " + playerName, "PlainText");

        if(GUI.Button(Rect(0,0, Screen.width,Screen.height), "", "FullImage")){
            leaveFor(menus.main);
        }
    }
    else{
        //prompt for name
        GUI.Label(Rect(0,0, Screen.width - 175, Screen.height + 60),"Enter your name:", "PlainText");


        if(newName && GUI.Button(Rect(0,0, Screen.width,Screen.height), "", "FullImage")){
            playerName = newName;
            playerScript.setName(newName);
            leaveFor(menus.main);
        }

        newName = GUILayout.TextField(newName, 20);

   }

}

function enter(){
    showMenu = true;
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}


function onTouchKeyboard()
{
    // var tempString = "YO";
    // if ( !iskBoardOpen )
    // {
    //    keyboard = TouchScreenKeyboard.Open( tempString, TouchScreenKeyboardType.Default, false, false, false, false, "Default Keyboard" );
    //    iskBoardOpen = true;
    // }

    // if ( keyboard.done )
    // {
    //    kBoardString = keyboard.text;
    //    tempString = "";
    //    iskBoardOpen = false;
    // }
    // else
    // {
    //    kBoardString = keyboard.text;
    // }
}

