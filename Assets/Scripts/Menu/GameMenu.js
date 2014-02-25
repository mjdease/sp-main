#pragma strict
#pragma downcast

private var gameManager : GameObject;
private var menuScript : Menu;
private var playerScript : PlayerScript;
private var gameSetupScript : GameSetupScript;
private var netScript : Net;

private var showMenu : boolean = false;
private var isHosting : boolean = false;
private var isStartingServer : boolean = false;
private var gameName : String;
private var playerLimit : int = 4;
private var selectCharacter : boolean = false;
private var showStatusBar : boolean = false;

private var guiHost : GuiClasses[];
private var guiObject : GuiClasses [];
private var guiNewGame: GuiClasses [];
private var guiVersus:GuiClasses[];

private var playerTexture : Texture2D;
private var playerSelfTexture : Texture2D;
private var commanderTexture : Texture2D;
private var homeTexture : Texture2D;
private var startTexture : Texture2D;
private var backgroundTexutre : Texture2D;
private var createNewOverlayTexture : Texture2D;
private var backTexture : Texture2D;
private var readyCheckMarkTexture : Texture2D;
private var statusBarTexture : Texture2D;
private var arrowTexture : Texture2D;
private var arrowDownTexture : Texture2D;
private var arrowTextureDisabled : Texture2D;
private var arrowDownTextureDisabled : Texture2D;

private var selectedPlayerIndex : int = 0;
private var playerTextures :Texture[ ] = new Texture[13];
private var playerSelfTextures :Texture[ ] = new Texture[13];

private var menuSkin : GUISkin;

private var headerText = 60;
private var bodyText = 50;
private var buttonText = 40;

private var player : Runner;

//TODO: Remove and put somewhere else.
private var charactersNames : String[] = ["Diane","Ruth","Luke", "Sarah", "Dan", "Ben", "Rachel", "Lauren", "Bill", "Maddy", "Bradley", "Daisy"];

public var playerList : Dictionary.<String,Player>;
public var teamList : List.<Team>;


function Awake() {
    netScript = GetComponent(Net);
}

function Start() {
    menuScript = Menu.script;
    gameManager = GameObject.Find("/GameManager");

    playerScript = gameManager.GetComponent(PlayerScript);
    gameSetupScript = gameManager.GetComponent(GameSetupScript);

    gameName = playerScript.getName() + "'s Game";

    //persist game manager object between scenes
    DontDestroyOnLoad(gameManager);

    menuSkin = Resources.Load("MenuSkin", GUISkin);
    backTexture = Resources.Load("Textures/gui/back", Texture2D);
    playerTexture = Resources.Load("Textures/gui/player", Texture2D);
    homeTexture = Resources.Load("Textures/gui/home", Texture2D);
    startTexture = Resources.Load("Textures/gui/startBtn", Texture2D);
    backgroundTexutre = Resources.Load("Textures/gui/mainMenuBackground", Texture2D);
    createNewOverlayTexture = Resources.Load("Textures/gui/createNewOverlay", Texture2D);
    readyCheckMarkTexture = Resources.Load("Textures/gui/readyCheckMark", Texture2D);
    statusBarTexture = Resources.Load("Textures/gui/statusBar", Texture2D);
    arrowTexture = Resources.Load("Textures/gui/arrow", Texture2D);
    arrowDownTexture = Resources.Load("Textures/gui/arrowDown", Texture2D);
    arrowTextureDisabled = Resources.Load("Textures/gui/arrowFaded", Texture2D);
    arrowDownTextureDisabled = Resources.Load("Textures/gui/arrowDownFaded", Texture2D);

    guiHost = new GuiClasses[5];
    for (var x = 0; x < guiHost.length; x++) {
        guiHost[x] = new GuiClasses();
    }

    guiObject = new GuiClasses[2];
    for (var y = 0; y < guiObject.length; y++) {
        guiObject[y] = new GuiClasses();
    }

    guiNewGame = new GuiClasses[5];
    for (var z = 0; z < guiNewGame.length; z++) {
        guiNewGame[z] = new GuiClasses();
    }

    guiVersus = new GuiClasses[5];
    for (var w = 0; w < guiVersus.length; w++) {
        guiVersus[w] = new GuiClasses();
    }

       for (var i = 0; i < 13; i++) {
        if (i < 9) {
            playerTexture = Resources.Load("Textures/gui/player" + i, Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/player" + i + "_self", Texture2D);
        } else  if(i < 11) {
            playerTexture = Resources.Load("Textures/gui/commander" + i, Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/commander" + i + "_self", Texture2D);
        } else {
            playerTexture = Resources.Load("Textures/gui/player_empty", Texture2D);
            playerSelfTexture = Resources.Load("Textures/gui/player_empty_self", Texture2D);
        }
        playerTextures[i] = playerTexture;
        playerSelfTextures[i] = playerSelfTexture;

    }
}

function OnGUI() {

    if (!showMenu) {
        return;
    }

    GUI.skin = menuSkin;

    GUI.DrawTexture(new Rect(0, 0, Screen.width, Screen.height), backgroundTexutre);

    if(showStatusBar){
        GUI.Label(new Rect(0, Screen.height / 2 - Screen.height / 2.5, Screen.width, 0), gameName, "Header");
        GUI.DrawTexture(new Rect(0, Screen.height - 100 * menuScript.getScale(), Screen.width, 100 * menuScript.getScale()), statusBarTexture);
    }

    //Scales different text based on windows size
    var localStyle: GUIStyle = GUI.skin.GetStyle("PlainText");
    localStyle.fontSize = menuScript.getScale() * bodyText;

    var headerStyle: GUIStyle = GUI.skin.GetStyle("Header");
    headerStyle.fontSize = menuScript.getScale() * headerText;

    var greenStyle: GUIStyle = GUI.skin.GetStyle("GreenButton");
    greenStyle.fontSize = menuScript.getScale() * buttonText;

    var whiteText: GUIStyle = GUI.skin.GetStyle("WhiteText");
    whiteText.fontSize = menuScript.getScale() * buttonText;

    GUI.skin.textField.fontSize = menuScript.getScale() * bodyText;

    //Home Btn
    guiObject[1].setLocation(Points.TopRight);

    if (GUI.Button(Rect(Screen.width - Screen.width * 0.09, guiObject[1].offset.y - Screen.height * 0.01, Screen.width * 0.08, Screen.height * 0.2), homeTexture, "FullImage")) {
        selectCharacter = false;
        leaveFor(menus.main);
    }

    /* ---------- CREATE NEW GAME SCREEN ---------- */
    if (isHosting && !Network.isServer) {
        GUI.Label(new Rect(0, Screen.height / 2 - Screen.height / 2.5, Screen.width, 0), "NEW GAME", "Header");

        guiNewGame[0].textureWidth = Screen.width;
        guiNewGame[0].textureHeight = 100;
        guiNewGame[0].setLocation(Points.Center);

        guiNewGame[1].textureWidth = Screen.width / 2.2;
        guiNewGame[1].textureHeight = menuScript.getScale() * 100;
        guiNewGame[1].setLocation(Points.Center);

        guiNewGame[2].textureWidth = Screen.width / 5.5;
        guiNewGame[2].textureHeight = Screen.height / 10;
        guiNewGame[2].setLocation(Points.Center);

        guiNewGame[3].textureWidth = Screen.width / 1.5;
        guiNewGame[3].textureHeight = Screen.height / 1.5;
        guiNewGame[3].setLocation(Points.Center);

        GUI.DrawTexture(new Rect(guiNewGame[3].offset.x, guiNewGame[3].offset.y, Screen.width / 1.5, Screen.height / 1.5), createNewOverlayTexture);

        GUI.Label(Rect(guiNewGame[0].offset.x, guiNewGame[0].offset.y - Screen.height / 5, Screen.width, 100), "Game Name", "PlainText");
        gameName = GUI.TextField(Rect(guiNewGame[1].offset.x, guiNewGame[1].offset.y - Screen.height / 12, Screen.width / 2.2, menuScript.getScale() * 100), gameName, 20);
        GUI.Label(Rect(guiNewGame[0].offset.x, guiNewGame[0].offset.y + Screen.height / 24, Screen.width, 100), "Player Limit", "PlainText");
        playerLimit = parseInt(GUI.TextField(Rect(guiNewGame[1].offset.x, guiNewGame[1].offset.y + Screen.height / 6, Screen.width / 2.2, menuScript.getScale() * 100), playerLimit.ToString(), 20)) || 0;

        if (GUI.Button(Rect(guiNewGame[2].offset.x, guiNewGame[2].offset.y + Screen.height / 2.5, Screen.width / 5.5, Screen.height / 10), "CREATE", "GreenButton")) {
            netScript.startHost(playerLimit, gameName, onServerInitialize);
            isStartingServer = true;
        }
    }

    /* ---------- STARTING SERVER LOAD SCREEN ---------- */
    else if (isStartingServer) {
        guiNewGame[4].textureWidth = Screen.width / 1.5;
        guiNewGame[4].textureHeight = Screen.height / 1.5;
        guiNewGame[4].setLocation(Points.Center);

        GUI.DrawTexture(new Rect(guiNewGame[4].offset.x, guiNewGame[4].offset.y, Screen.width / 1.5, Screen.height / 1.5), createNewOverlayTexture);
        GUI.Label(Rect(0, 0, Screen.width, Screen.height), "Starting server. Please Wait...", "PlainText");
    }
    /* ---------- PLAYER LOBBY SCREEN ---------- */
    else if (Network.isClient || (isHosting && Network.isServer)) {

        showStatusBar = true;
        playerList = gameSetupScript.game.getPlayers();
        teamList = gameSetupScript.game.getTeams();

       for (var team: Team in teamList) {

            var teamPlayer : Dictionary.<String,Player> = team.getTeammates();
            for (var teammate: Player in teamPlayer.Values) {
                    Debug.Log("Team One: " + team.getId() + " --- " + teammate.getName());
            }

        }


        for (var n = 0; n < 2; n++) {
            guiObject[n].textureWidth = Screen.width * 0.06;
            guiObject[n].textureHeight = Screen.height * 0.1;
        }

        if (selectCharacter == false) {

            guiHost[1].textureWidth = Screen.width * 0.15;
            guiHost[1].textureHeight = Screen.height * 0.2;
            guiHost[1].setLocation(Points.Center);


            var currentTeamCount : int = 0;
            var teamCount: int = playerList.Count;
            var isVersus : boolean = false;
            var showEmpty : boolean = false;
            var playerCount = 0;
            var layoutOffset = 0;
            var cPlayer: Player;

            if (!isVersus) {
                for (var d = 0; d < Config.MAX_TEAM_COUNT; d++) {

                    currentTeamCount = d;

                    if (currentTeamCount > teamCount -1 ) {
                        showEmpty = true;
                        currentTeamCount = 11;
                    } else {
                        cPlayer = playerList[playerList.Keys.ToList()[d]];
                    }

                        //Layout of the players squares
                        switch(playerCount){
                            case 0:
                                layoutOffset = (-2) * guiHost[1].textureWidth;
                            break;
                            case 1:
                                layoutOffset = (-1) * guiHost[1].textureWidth;
                            break;
                            case 2:
                                layoutOffset = 0;
                            break;
                            case 3:
                                layoutOffset = (1) * guiHost[1].textureWidth;
                            break;
                            case 4:
                                layoutOffset = (2) * guiHost[1].textureWidth;
                            break;
                        }


                        if(showEmpty) {
                            GUI.Button(Rect(guiHost[1].offset.x + layoutOffset, guiHost[1].offset.y, Screen.width * 0.15, Screen.height * 0.20), playerTextures[currentTeamCount], "FullImage");
                        }
                        else if(!showEmpty) {
                            if (Util.IsNetworkedPlayerMe(cPlayer)) {
                                if (GUI.Button(Rect(guiHost[1].offset.x + layoutOffset, guiHost[1].offset.y , Screen.width * 0.15, Screen.height * 0.20), playerSelfTextures[cPlayer.selectedCharacter], "FullImage")) {
                                    selectCharacter = true;
                                }
                            } else {
                                GUI.Button(Rect(guiHost[1].offset.x + layoutOffset, guiHost[1].offset.y , Screen.width * 0.15, Screen.height * 0.20), playerTextures[cPlayer.selectedCharacter], "FullImage");
                            }

                            GUI.Label(Rect(guiHost[1].offset.x + layoutOffset, guiHost[1].offset.y  + Screen.height * 0.2 - 15, Screen.width * 0.15, Screen.height * 0.20), cPlayer.getName(), "WhiteText");

                            if (cPlayer.isReady) {
                                GUI.Button(Rect(guiHost[1].offset.x + layoutOffset + guiHost[1].textureWidth / 1.6, guiHost[1].offset.y - guiHost[1].textureHeight / 6, menuScript.getScale() * 135, menuScript.getScale() * 105), readyCheckMarkTexture, "FullImage");
                            }
                        }
                         ++playerCount;
                }

            } else {

                guiVersus[2].textureWidth = Screen.width * 0.09;
                guiVersus[2].textureHeight = Screen.height * 0.12;
                guiVersus[2].setLocation(Points.Center);

                guiVersus[3].textureWidth = Screen.width * 0.13;
                guiVersus[3].textureHeight = Screen.height * 0.18;
                guiVersus[3].setLocation(Points.Center);

                guiVersus[4].textureWidth = Screen.width * 0.15;
                guiVersus[4].textureHeight = Screen.height * 0.1;
                guiVersus[4].setLocation(Points.Center);

                var leftLayoutCount = 0;
                var rightLayoutCount = 0;

                GUI.Button(Rect(guiVersus[4].offset.x, guiVersus[4].offset.y - Screen.height*0.05 - Screen.height*0.13, guiVersus[4].textureWidth, guiVersus[4].textureHeight), arrowTexture, "FullImage");
                GUI.Button(Rect(guiVersus[4].offset.x, guiVersus[4].offset.y - Screen.height*0.05 + Screen.height*0.13, guiVersus[4].textureWidth, guiVersus[4].textureHeight), arrowDownTexture, "FullImage");

                    //Team 1
                    for (var a = 0; a < Config.MAX_TEAM_COUNT; a ++) {

                        switch(a){
                            case 0:
                                layoutOffset = (-2) * guiVersus[3].textureWidth;
                            break;
                            case 1:
                                layoutOffset = (-1) * guiVersus[3].textureWidth;
                            break;
                            case 2:
                                layoutOffset = 0;
                            break;
                            case 3:
                                layoutOffset = (1) * guiVersus[3].textureWidth;
                            break;
                            case 4:
                                layoutOffset = (2) * guiVersus[3].textureWidth;
                            break;
                        }

                        GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset, guiVersus[3].offset.y - Screen.height*0.05 - guiVersus[3].offset.y/1.4, guiVersus[3].textureWidth, guiVersus[3].textureHeight), playerTextures[11], "FullImage");
                    }

                    //Team 2

                    for (var b = 0; b < Config.MAX_TEAM_COUNT; b ++) {

                        switch(b){
                            case 0:
                                layoutOffset = (-2) * guiVersus[3].textureWidth;
                            break;
                            case 1:
                                layoutOffset = (-1) * guiVersus[3].textureWidth;
                            break;
                            case 2:
                                layoutOffset = 0;
                            break;
                            case 3:
                                layoutOffset = (1) * guiVersus[3].textureWidth;
                            break;
                            case 4:
                                layoutOffset = (2) * guiVersus[3].textureWidth;
                            break;
                        }

                        GUI.Button(Rect(guiVersus[3].offset.x + layoutOffset, guiVersus[3].offset.y - Screen.height*0.05 + guiVersus[3].offset.y/1.4, guiVersus[3].textureWidth, guiVersus[3].textureHeight), playerTextures[11], "FullImage");
                    }

                    //Middle - go through all the players and list the ones not assigned to a team

                     for (var e = 0; e < teamCount; e++) {

                        cPlayer = playerList[playerList.Keys.ToList()[e]];

                        if(teamCount % 2 == 1) {

                            if(e == 0) {
                               layoutOffset = 0;
                            } else if (e % 2 == 1) {
                                leftLayoutCount++;
                                layoutOffset = leftLayoutCount * guiVersus[2].textureWidth;
                            } else {
                                rightLayoutCount++;
                                layoutOffset = (-rightLayoutCount) * guiVersus[2].textureWidth;
                            }
                            GUI.Button(Rect( guiVersus[2].offset.x + layoutOffset,  guiVersus[2].offset.y - Screen.height*0.05,  guiVersus[2].textureWidth ,  guiVersus[2].textureHeight ), (Util.IsNetworkedPlayerMe(cPlayer) ? playerSelfTextures[cPlayer.selectedCharacter] : playerTextures[cPlayer.selectedCharacter]) , "FullImage");

                        } else {
                            if (e % 2 == 1) {
                                leftLayoutCount++;
                                if(leftLayoutCount == 1) {
                                    layoutOffset = leftLayoutCount * guiVersus[2].textureWidth/2;
                                } else layoutOffset = leftLayoutCount * guiVersus[2].textureWidth - guiVersus[2].textureWidth/2;

                            } else {
                                rightLayoutCount++;

                                if(rightLayoutCount == 1) {
                                    layoutOffset = (-rightLayoutCount) * guiVersus[2].textureWidth/2;
                                }
                                else layoutOffset = (-rightLayoutCount) * guiVersus[2].textureWidth + guiVersus[2].textureWidth/2;
                            }

                            GUI.Button(Rect( guiVersus[2].offset.x + layoutOffset,  guiVersus[2].offset.y - Screen.height*0.05,  guiVersus[2].textureWidth ,  guiVersus[2].textureHeight ), playerTextures[cPlayer.selectedCharacter], "FullImage");

                        }
                    }

                        guiHost[2].textureWidth = Screen.width * 0.17;
                        guiHost[2].textureHeight = Screen.height * 0.11;
                        guiHost[2].setLocation(Points.BottomRight);

                        if (isHosting) {
                            if (GUI.Button(Rect(guiHost[2].offset.x, Screen.height - Screen.height * 0.13 - (100 * menuScript.getScale()), Screen.width * 0.17, Screen.height * 0.11), "START", "GreenButton")) {
                                gameSetupScript.enterGame();
                            }

                        } else {
                             if (GUI.Button(Rect(guiHost[2].offset.x, Screen.height - Screen.height * 0.13 - (100 * menuScript.getScale()), Screen.width * 0.17, Screen.height * 0.11), (playerScript.getSelf().isReady ? "EDIT" : "READY"), "GreenButton")) {

                                if(playerScript.getSelf().isReady) playerScript.getSelf().isReady = false;
                                else playerScript.getSelf().isReady = true;

                                GameObject.Find("/GameManager").networkView.RPC("updateReadyStatus", RPCMode.OthersBuffered, playerScript.getSelf().getId(),playerScript.getSelf().isReady);

                            }

                }
            }
        }

        /* ----------  CHARACTER SELECTION SCREEN ---------- */
        else {
            showStatusBar = false;

            //Back Btn
            guiObject[0].setLocation(Points.TopLeft);


            if (GUI.Button(Rect(guiObject[0].offset.x + Screen.width * 0.01, guiObject[0].offset.y - Screen.height * 0.01, Screen.width * 0.08, Screen.height * 0.2), backTexture, "FullImage")) {
                selectCharacter = false;
            }
            //Characters gui
            guiObject[1].textureWidth = Screen.width * 0.8;
            guiObject[1].textureHeight = Screen.height * 0.8;
            guiObject[1].setLocation(Points.Center);

            guiObject[0].textureWidth = Screen.width * 0.15;
            guiObject[0].textureHeight = Screen.height * 0.2;


            for (var c = 0; c < 9; c++) {
                var offsetWidth = 0;
                var offsetHeight = 0;
                if (c == 0 || c == 1 || c == 2) {
                    offsetHeight = Screen.height * 0.03;
                }
                if (c == 1 || c == 4 || c == 7) {
                    offsetWidth = Screen.width * 0.2;
                }
                if (c == 2 || c == 5 || c == 8) {
                    offsetWidth = Screen.width * 0.4;
                }
                if (c == 3 || c == 4 || c == 5) {
                    offsetHeight = Screen.height * 0.33;
                }
                if (c == 6 || c == 7 || c == 8) {
                    offsetHeight = Screen.height * 0.63;
                }

                playerTexture = Resources.Load("Textures/gui/player" + c, Texture2D);

                if (GUI.Button(Rect(guiObject[1].offset.x + offsetWidth, guiObject[1].offset.y + offsetHeight, Screen.width * 0.15, Screen.height * 0.20), playerTexture, "FullImage")) {
                    playerScript.getSelf().selectedCharacter = c;
                    Debug.Log("In Game Menu Runner Selected");
                    GameObject.Find("/GameManager").networkView.RPC("updateCharacter", RPCMode.OthersBuffered, playerScript.getSelf().getId(), playerScript.getSelf().selectedCharacter);
                    selectCharacter = false;
                }
                GUI.Label(Rect(guiObject[1].offset.x + offsetWidth, (guiObject[1].offset.y + offsetHeight) + (Screen.height * 0.20 / 1.4), Screen.width * 0.15, Screen.height * 0.20), charactersNames[c], "WhiteText");

            }

            //Commanders gui
            for (var p = 0; p < 3; p++) {
                var h = 0;
                if (p == 0) {
                    h = Screen.height * 0.03;
                }
                if (p == 1) {
                    h = Screen.height * 0.33;
                }
                if (p == 2) {
                    h = Screen.height * 0.63;
                }

                var count = 9 + p;
                commanderTexture = Resources.Load("Textures/gui/commander" + count, Texture2D);

                if (GUI.Button(Rect(Screen.width * 0.75, guiObject[1].offset.y + h, Screen.width * 0.15, Screen.height * 0.20), commanderTexture, "FullImage")) {
                    playerScript.getSelf().selectedCharacter = count;
                    Debug.Log("In Game Menu SelectingCommander");
                    GameObject.Find("/GameManager").networkView.RPC("changeToCommander", RPCMode.OthersBuffered, playerScript.getSelf().getId(), playerScript.getSelf().selectedCharacter );
                    selectCharacter = false;
                }

                GUI.Label(Rect(Screen.width * 0.75, guiObject[1].offset.y + h + (Screen.height * 0.20 / 1.4), Screen.width * 0.15, Screen.height * 0.20), charactersNames[count], "WhiteText");

            }
        }
    }
}

function onServerInitialize(success: boolean){
    if(success){
        isStartingServer = false;
        gameSetupScript.registerPlayerProxy(playerScript.getName());
    }
}

function enter(isNew : boolean){
    showMenu = true;
    isHosting = isNew;

    gameSetupScript.game = new Game();

    if(Network.isClient){
        gameSetupScript.registerPlayerProxy(playerScript.getName());
    }
}

function leaveFor(newMenu : menus){
    showMenu = false;
    menuScript.stateScript.setCurrentMenu(newMenu);
    menuScript.open();
}
