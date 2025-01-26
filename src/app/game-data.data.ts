import { default as AchievementCategories } from '../gamedata/AchievementCategories.json'
import { default as AchievementCategoryAssociationsClient } from '../gamedata/AchievementCategoryAssociationsClient.json'
import { default as AchievementsClient } from '../gamedata/AchievementsClient.json'
import { default as AchievementComponentsClient } from '../gamedata/AchievementComponentsClient.json'
import { default as AchievementAssociationsClient } from '../gamedata/AchievementAssociationsClient.json'

export class GameData {
    static makeMenuData() {
        const data = [];

        // Add the top level categories.
        for (const row of AchievementCategories.data.filter((row) => row[0] == 0)) {
            data.push({
                'id': row[2],
                'name': row[3],
                'tooltip': row[4],
                'order': row[1],
                'children': [] as any
            });
        }

        // Add the sub-level categories.
        for (const row of AchievementCategories.data.filter((row) => row[0] != 0)) {
            const parent = data.find((item) => item.id == row[0]);
            if (parent === undefined) { continue }

            parent.children.push({
                'id': row[2],
                'name': row[3],
                'tooltip': row[4],
                'order': row[1],
            });
        }

        return data;
    }

    static getCategoryID(category: string): string {
        const el = AchievementCategories.data.filter((row) => row[0] == 0).find((row) => row[3] === category);
        if (el === undefined) {
            throw new Error("Invalid category: " + category);
        }

        return String(el[2]);
    }

    static getAchievementID(category1: string, category2: string): number {
        const categoryID = this.getCategoryID(category1);

        const ael = AchievementCategories.data.find((row) => row[3] === category2 && String(row[0]) === categoryID);
        if (ael === undefined) {
            throw new Error("Invalid category/subcategory: " + category1 + "/" + category2);
        }

        return ael[2] as number;
    }

    static getCategoryPair(category1: string, category2: string): string[] {
        const categoryID = this.getCategoryID(category1);

        const el = AchievementCategories.data.find((row) => row[3] === category2 && String(row[0]) === categoryID);
        if (el === undefined) {
            throw new Error("Invalid category/subcategory: " + category1 + "/" + category2);
        }

        //console.log('getCategoryPair: return: [%d, %d]', categoryID, el[2]);
        return [String(categoryID), String(el[2])]
    }

    static getClientIDsForAchievement(aid: string) {
        let data: number[] = [];
        //console.log("getClientIDs(): aid:", aid);
        AchievementCategoryAssociationsClient.data.filter((row) => String(row[0]) === aid).forEach((v) => {
            data.push(v[2]);
        });
        return data;
    }

    static getClients(ids: number[]) {
        let data: any[] = [];
        AchievementsClient.data.filter((row) => ids.includes(row[0] as number)).forEach((row) => {
            data.push(row);
        });
        return data;
    }

    /*
     * FIX-ME: character epics use the names task names 'Epic 1.0', 'Epic 1.5', 'Epic 2.0', 'Epic 2.5', and 'An Epic Retelling'
     *         but those names are repeated 16 times in AchievementsClient.txt, so we'll need to handle it as an edge case.
     * 
General: Class
C       Epic 1.0
C               Obtain Innoruuk's Curse
I       Epic 1.5
I               Obtain Innoruuk's Voice
I       Epic 2.0
I               Obtain the Innoruuk's Dark Blessing
I       Epic 2.5
I               Obtain Innoruuk's Shard of the Ancients
I       An Epic Request
I               Lady Carolline of Thex in Felwithe - An Epic Request
I               Earn the right to request ornamentations of your epic 1.0.
I               Earn the right to request ornamentations of your epic 1.5 and 2.0.
     */
    static getClientID(category1ID: string, category2ID: string, name: string): string {
        let clientID = "";

        const clientIDs = this.getClientIDsForAchievement(category2ID);
        const row = AchievementsClient.data.filter((row) => clientIDs.includes(row[0] as number)).find((row) => row[1] === name);
        if (row === undefined) {
            console.log('getClientID(%d, %d, "%s") has no entry', category1ID, category2ID, name);
        }
        else {            
            clientID = String(row[0]);
        }

        //console.log('getClientID(%d, %d, "%s"): return: %d', category1ID, category2ID, name, clientID);
        return clientID;
    }

    /*
     * There are some components that only show up when an in-game condition is met.

    Ruins of Kunark(200)/Hunter(208)/Hunter of Veeshan's Peak(210880):
AchievementComponentsClient.txt:
210880^1^1^2001242^an ancient racnar^
210880^2^1^2001244^a cruel racnar^
210880^3^1^2001236^a dangerous lava drake^
210880^4^1^2001235^a deadly lava drake^
210880^5^1^2001239^an enraged guardian wurm^
210880^6^1^2001243^a feral racnar^
210880^7^1^2001240^a frenzied guardian wurm^
210880^8^1^2001238^a furious guardian wurm^
210880^9^1^2001237^a malicious lava drake^
210880^10^1^2001241^a savage racnar^
210880^11^3^2001503^Veeshan's Peak - Availability^

    2001503 - if this condition is true, then clientID 250880 instead of 210880.

250880^1^3^2001504^Veeshan's Peak (Enhanced) - Availability^
250880^2^1^2001247^Blood-Thirsty Racnar^
250880^3^1^2001248^Elder Ekron^
250880^4^1^2001249^Kluzen the Protector^
250880^5^1^2001246^Magma Basilisk^
250880^6^1^2001250^Milyex Vioren^
250880^7^1^2001251^Qunard Ashenclaw^
250880^8^1^2001245^Travenro the Skygazer^

    */

    static getComponentID(category1ID: string, category2ID: string, clientID: string, component: string): string {
        let componentID = "";

        const row = AchievementComponentsClient.data.find((row) => clientID == row[0] && component === row[4]);
        if (row === undefined) {
            console.log('getComponentID(%d, %d, %d, "%s") has no entry', category1ID, category2ID, clientID, component);
        }
        else {
            componentID = String(row[3]);
            //console.log('getComponentID(%d, %d, %d, "%s") returns: %d', category1ID, category2ID, clientID, component, componentID);
        };

        return componentID;
    }
}
