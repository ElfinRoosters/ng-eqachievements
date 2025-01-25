import { default as AchievementCategories } from '../gamedata/AchievementCategories.json'

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
        for (const row of AchievementCategories.data.filter((row) => row[0] != 0 )) {
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

    static getCategoryID(category:string): number | undefined {
        const el =  AchievementCategories.data.find((row) => row[3] === category);
        if (el === undefined) { return undefined }

        if (typeof el[2] === 'string') {
            return parseInt(el[2]);
        }
        return el[2];
    }

    static getAchievementID(category:string, name:string): number | undefined {
        const el =  AchievementCategories.data.find((row) => row[3] === category);
        if (el === undefined) { return undefined }

        const ael = AchievementCategories.data.find((row) => row[3] === name && row[0] === el[0]);
        if (ael === undefined) { return undefined }

        if (typeof ael[2] === 'string') {
            return parseInt(ael[2]);
        }
        return ael[2];
    }

}
