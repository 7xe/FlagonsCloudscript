//--------------------------------------------------------------------------------------------------//
//Variables

let GOLD_CODE :string = "GP";

handlers.BeginDungeon = function (args) {

    let currentTime = Date.now();

    let itemId: string;
    if(args && args.hasOwnProperty("ItemId")){
        itemId = args["ItemId"];
        log.info("We used the argument passed to us " + itemId);
    } else {
        itemId = "FirstDungeon";
        log.info("We defaulted to FirstDungeon");
    }

    let GrantItemRequest: PlayFabServerModels.GrantItemsToUsersRequest = {
        CatalogVersion: "main",
        ItemGrants:[
            {
              PlayFabId: currentPlayerId,
              ItemId: itemId,
              Data: {
                "StartTime": currentTime.toString(),
              }
            },
        ]
    };
    
    let grantItemResult = server.GrantItemsToUsers(GrantItemRequest);

    return grantItemResult.ItemGrantResults;
}

handlers.CompleteDungeon = function (args) {

    let currentTime = Date.now();
    let inventory = server.GetUserInventory({PlayFabId: currentPlayerId});
    
    let itemId: string;

    if(args && args.hasOwnProperty("ItemId")){
        itemId = args["ItemId"];
        log.info("We used the argument passed to us " + itemId);
    } else {
        itemId = "FirstDungeon";
        log.info("We defaulted to FirstDungeon");
    }
    
    let dungeon: PlayFabServerModels.ItemInstance = null;

    //find the first dungeon in inventory
    inventory.Inventory.forEach(function(item, index, array){
        if(item.ItemId == itemId){
            dungeon = item;
            return;
        }
    });

    if(dungeon !== null){

        const endTime: number = Date.parse(dungeon.CustomData["StartTime"]) + Date.parse(dungeon.CustomData["Duration"]);

        if(currentTime > endTime){
            const GrantItemRequest = {
                PlayFabId : currentPlayerId,
                CatalogVersion : "main",
                ItemIds : [ dungeon.ItemId + "DummyKey" ],
            }
        
            server.GrantItemsToUser(GrantItemRequest);
        
            let UnlockContainerRequest = {
                PlayFabId : currentPlayerId,
                CatalogVersion : "main",
                ContainerItemId : dungeon.ItemId,
            }
        
            server.UnlockContainerItem(UnlockContainerRequest);
        }
    }
}

handlers.GetMonies = function (args) {
    let GetUserInventoryRequest = {
        "PlayFabId" : currentPlayerId
    };
    let GetUserInventoryResult = server.GetUserInventory(GetUserInventoryRequest);

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