//--------------------------------------------------------------------------------------------------//
//Variables

let GOLD_CODE :string = "GP";

handlers.BeginDungeon = function (args) {

    let currentTime = Date.now();

    let GrantItemRequest: PlayFabServerModels.GrantItemsToUsersRequest = {
        CatalogVersion: "main",
        ItemGrants:[
            {
              PlayFabId: currentPlayerId,
              ItemId: "One",
              Annotation: "why this aint working"
            },
            {
              PlayFabId: currentPlayerId,
              ItemId: "FirstDungeon",
              Annotation: "pls work",
              Data: {
                "EndTime": currentTime.toString(),
              }
            }
        ]
    };
    

    let grantItemResult = server.GrantItemsToUsers(GrantItemRequest);
    
    //var lastMoveTime = Date.parse(lastMoveTimestampSetting.Value);

    log.debug(currentTime.toString());
    
    return grantItemResult;
}

handlers.CompleteDungeon = function (args) {

    var currentTime = Date.now();

    var GrantItemRequest = {
        PlayFabId : currentPlayerId,
        CatalogVersion : "main",
        ItemIds : [ "FirstDungeonDummyKey" ],
    }

    server.GrantItemsToUser(GrantItemRequest);

    var UnlockContainerRequest = {
        PlayFabId : currentPlayerId,
        CatalogVersion : "main",
        ContainerItemId : "FirstDungeon",
    }

    server.UnlockContainerItem(UnlockContainerRequest);
}

handlers.GetMonies = function (args) {
    var GetUserInventoryRequest = {
        "PlayFabId" : currentPlayerId
    };
    var GetUserInventoryResult = server.GetUserInventory(GetUserInventoryRequest);

    var userInventory = GetUserInventoryResult.Inventory;
    var userVCBalances = GetUserInventoryResult.VirtualCurrency;

    AddVC(userVCBalances, GOLD_CODE, 50);
}

function AddVC(vcBalances: {[key:string]: number}, code: string, amount: number)
{
    if(vcBalances !== null && vcBalances.hasOwnProperty(code)){
        vcBalances[code] += amount;
    }

    var AddUserVirtualCurrencyRequest = {
        "PlayFabId" : currentPlayerId,
        "VirtualCurrency" : code,
        "Amount" : amount
    };

    
    var AddUserVirtualCurrencyResult = server.AddUserVirtualCurrency(AddUserVirtualCurrencyRequest);
}