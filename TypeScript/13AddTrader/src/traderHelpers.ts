import {PreSptModLoader} from "@spt/loaders/PreSptModLoader";
import {IItem} from "@spt/models/eft/common/tables/IItem";
import {ITraderBase, ITraderAssort} from "@spt/models/eft/common/tables/ITrader";
import {ITraderConfig, IUpdateTime} from "@spt/models/spt/config/ITraderConfig";
import {IDatabaseTables} from "@spt/models/spt/server/IDatabaseTables";
import {ImageRouter} from "@spt/routers/ImageRouter";
import {JsonUtil} from "@spt/utils/JsonUtil";
import {NewItemIds} from "./newItemIds";

export class TraderHelper {

    /**
     * Add record to trader config to set the refresh time of trader in seconds (default is 60 minutes)
     * @param traderConfig trader config to add our trader to
     * @param baseJson json file for trader (db/base.json)
     * @param refreshTimeSecondsMin How many seconds between trader stock refresh min time
     * @param refreshTimeSecondsMax How many seconds between trader stock refresh max time
     */
    public setTraderUpdateTime(traderConfig: ITraderConfig, baseJson: any, refreshTimeSecondsMin: number, refreshTimeSecondsMax: number): void {
        // Add refresh time in seconds to config
        const traderRefreshRecord: IUpdateTime = {
            traderId: baseJson._id,
            seconds: {
                min: refreshTimeSecondsMin,
                max: refreshTimeSecondsMax,
            },
        };

        traderConfig.updateTime.push(traderRefreshRecord);
    }

    /**
     * Add our new trader to the database
     * @param traderDetailsToAdd trader details
     * @param tables database
     * @param jsonUtil json utility class
     */
    public addTraderToDb(traderDetailsToAdd: any, tables: IDatabaseTables, jsonUtil: JsonUtil): void {
        // Add trader to trader table, key is the traders id
        tables.traders[traderDetailsToAdd._id] = {
            assort: this.createAssortTable(), // assorts are the 'offers' trader sells, can be a single item (e.g. carton of milk) or multiple items as a collection (e.g. a gun)
            base: jsonUtil.deserialize(jsonUtil.serialize(traderDetailsToAdd)) as ITraderBase, // Deserialise/serialise creates a copy of the json and allows us to cast it as an ITraderBase
            questassort: {
                started: {},
                success: {},
                fail: {},
            }, // questassort is empty as trader has no assorts unlocked by quests
        };
    }

    /**
     * Create basic data for trader + add empty assorts table for trader
     * @returns ITraderAssort
     */
    private createAssortTable(): ITraderAssort {
        // Create a blank assort object, ready to have items added
        const assortTable: ITraderAssort = {
            nextResupply: 0,
            items: [],
            barter_scheme: {},
            loyal_level_items: {},
        };

        return assortTable;
    }

    /**
     * Create a weapon from scratch, ready to be added to trader
     * @returns Item[]
     */
    public createGlock(): IItem[] {
        // Create an array ready to hold weapon + all mods
        const glock: IItem[] = [];

        // Add the base first
        glock.push({ // Add the base weapon first
            _id: NewItemIds.GLOCK_BASE, // Ids matter, MUST BE UNIQUE See mod.ts for more details
            _tpl: "5a7ae0c351dfba0017554310", // This is the weapons tpl, found on: https://db.sp-tarkov.com/search
        });

        // Add barrel
        glock.push({
            _id: NewItemIds.GLOCK_BARREL,
            _tpl: "5a6b60158dc32e000a31138b",
            parentId: NewItemIds.GLOCK_BASE, // This is a sub item, you need to define its parent its attached to / inserted into
            slotId: "mod_barrel", // Required for mods, you need to define what 'slot' the mod will fill on the weapon
        });

        // Add reciever
        glock.push({
            _id: NewItemIds.GLOCK_RECIEVER,
            _tpl: "5a9685b1a2750c0032157104",
            parentId: NewItemIds.GLOCK_BASE,
            slotId: "mod_reciever",
        });

        // Add compensator
        glock.push({
            _id: NewItemIds.GLOCK_COMPENSATOR,
            _tpl: "5a7b32a2e899ef00135e345a",
            parentId: NewItemIds.GLOCK_RECIEVER, // The parent of this mod is the reciever NOT weapon, be careful to get the correct parent
            slotId: "mod_muzzle",
        });

        // Add Pistol grip
        glock.push({
            _id: NewItemIds.GLOCK_PISTOL_GRIP,
            _tpl: "5a7b4960e899ef197b331a2d",
            parentId: NewItemIds.GLOCK_BASE,
            slotId: "mod_pistol_grip",
        });

        // Add front sight
        glock.push({
            _id: NewItemIds.GLOCK_FRONT_SIGHT,
            _tpl: "5a6f5d528dc32e00094b97d9",
            parentId: NewItemIds.GLOCK_RECIEVER,
            slotId: "mod_sight_rear",
        });

        // Add rear sight
        glock.push({
            _id: NewItemIds.GLOCK_REAR_SIGHT,
            _tpl: "5a6f58f68dc32e000a311390",
            parentId: NewItemIds.GLOCK_RECIEVER,
            slotId: "mod_sight_front",
        });

        // Add magazine
        glock.push({
            _id: NewItemIds.GLOCK_MAGAZINE,
            _tpl: "630769c4962d0247b029dc60",
            parentId: NewItemIds.GLOCK_BASE,
            slotId: "mod_magazine",
        });

        return glock;
    }

    /**
     * Add traders name/location/description to the locale table
     * @param baseJson json file for trader (db/base.json)
     * @param tables database tables
     * @param fullName Complete name of trader
     * @param firstName First name of trader
     * @param nickName Nickname of trader
     * @param location Location of trader (e.g. "Here in the cat shop")
     * @param description Description of trader
     */
    public addTraderToLocales(baseJson: any, tables: IDatabaseTables, fullName: string, firstName: string, nickName: string, location: string, description: string) {
        // For each language, add locale for the new trader
        const locales = Object.values(tables.locales.global);

        for (const locale of locales) {
            locale[`${baseJson._id} FullName`] = fullName;
            locale[`${baseJson._id} FirstName`] = firstName;
            locale[`${baseJson._id} Nickname`] = nickName;
            locale[`${baseJson._id} Location`] = location;
            locale[`${baseJson._id} Description`] = description;
        }
    }
}
