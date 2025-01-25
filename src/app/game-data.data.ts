import { default as AchievementCategories } from '../gamedata/AchievementCategories.json'
import { default as AchievementCategoryAssociationsClient } from '../gamedata/AchievementCategoryAssociationsClient.json'
import { default as AchievementsClient } from '../gamedata/AchievementsClient.json'

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

    static getCategoryID(category: string): number {
        const el = AchievementCategories.data.filter((row) => row[0] == 0).find((row) => row[3] === category);
        if (el === undefined) {
            throw new Error("Invalid category: " + category);
        }

        return el[2] as number;
    }

    static getAchievementID(category1: string, category2: string): number {
        const categoryID = this.getCategoryID(category1);

        const ael = AchievementCategories.data.find((row) => row[3] === category2 && row[0] == categoryID);
        if (ael === undefined) {
            throw new Error("Invalid category/subcategory: " + category1 + "/" + category2);
        }

        return ael[2] as number;
    }

    static getCategoryPair(category1: string, category2: string): number[] {
        const categoryID = this.getCategoryID(category1);

        const el = AchievementCategories.data.find((row) => row[3] === category2 && row[0] == categoryID);
        if (el === undefined) {
            throw new Error("Invalid category/subcategory: " + category1 + "/" + category2);
        }

        return [categoryID, el[2] as number]
    }

    static getClientIDsForAchievement(aid: number) {
        const data: number[] = [];
        //console.log("getClientIDs(): aid:", aid);
        AchievementCategoryAssociationsClient.data.filter((row) => row[0] == aid).forEach((v) => {
            data.push(v[2]);
        });
        return data;
    }

    static getClients(ids: number[]) {
        const data = [];
        return AchievementsClient.data.filter((row) => {
            return ids.includes(row[0] as number)
        });
    }

    static getClientID(category1ID: number, category2ID: number, arg2: string): number {
        const clientIDs = this.getClientIDsForAchievement(category2ID);
        AchievementsClient.data.filter((row) => {

        });

        return -1;
    }
    static getComponentID(category1ID: number, category2ID: number, clientID: number | undefined, component: string): number | undefined {
        throw new Error('Method not implemented.');
    }
}
