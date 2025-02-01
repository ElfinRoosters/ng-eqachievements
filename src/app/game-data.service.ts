import { inject, Injectable } from '@angular/core';
import { default as AchievementCategoriesData } from '../gamedata/AchievementCategories.json'
import { default as AchievementCategoryAssociationsClientData } from '../gamedata/AchievementCategoryAssociationsClient.json'
import { default as AchievementsClientData } from '../gamedata/AchievementsClient.json'
import { default as AchievementComponentsClientData } from '../gamedata/AchievementComponentsClient.json'
import { default as AchievementAssociationsClientData } from '../gamedata/AchievementAssociationsClient.json'
import { ConsoleLogService } from './console-log.service';

export class AchievementCategory {
  constructor(
    public id: number,
    public name: string,
    public order: number,
    public text: string,
    public parentID?: number
  ) { }
}

export class ACAClient {
  constructor(
    public id: number,
    public field1: number
  ) { }
}

export class AchCatAssClient {
  list = Array<ACAClient>();

  constructor(
    public categoryID: number
  ) { }
}

export class AchievementsClient {
  constructor(
    public id: number,
    public name: string,
    public text: string,
    public rewardID: number,
    public points: number,
    public hasRewards: number,
    public field7: number
  ) { }
}

export class AchievementComponent {
  constructor(
    public id: number,
    public name: string,
    public required: number,
    public count?: number
  ) { }
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  private readonly logger = inject(ConsoleLogService);
  private categories = new Map<number, AchievementCategory>();
  private acaclients = new Map<string, AchCatAssClient>();
  private clients = new Map<number, AchievementsClient>();
  private AchievementComponents = new Map<number, Array<AchievementComponent>>();

  constructor() {
    AchievementCategoriesData.data.forEach((row) => {
      this.categories.set(
        row[2] as number,
        new AchievementCategory(
          row.at(2) as number,
          row.at(3) as string,
          row.at(1) as number,
          row.at(4) as string,
          row[0] != 0 ? row.at(0) as number : undefined
        ));
    });

    AchievementCategoryAssociationsClientData.data.forEach((row) => {
      const k = String(row[0]);
      if (!this.acaclients.has(k)) {
        this.acaclients.set(k, new AchCatAssClient(row[0]));
      }
      this.acaclients.get(k)?.list.push(new ACAClient(row[2], row[1]));
    });

    AchievementsClientData.data.forEach((row) => {
      this.clients.set(row[0] as number, new AchievementsClient(
        row[0] as number, row[1] as string, row[2] as string,
        row[3] as number, row[4] as number, row[5] as number,
        row[6] as number
      ));
    });

    const aacd = new Map<number, number>();
    for (const [ac, required] of AchievementAssociationsClientData.data.values()) {
      aacd.set(ac, required);
    }

    AchievementComponentsClientData.data.forEach((row) => {
      const k = Number(row[0]);
      if (!this.AchievementComponents.has(k)) {
        this.AchievementComponents.set(k, new Array<AchievementComponent>());
      }
      this.AchievementComponents.get(k)?.push(new AchievementComponent(
        row[3] as number,
        row[4] as string,
        row[2] as number,
        aacd.get(row[3] as number)
      ));
    });
    this.addCustomAchievements();
  }

  addCustomAchievements() {
    const heroicAAsID = 10000;

    this.categories.set(heroicAAsID, new AchievementCategory(
      heroicAAsID, "Heroic AAs", 9, "General Achievements: Heroic AAs", 10
    ));
  }

  getCategory(categoryID: number) {
    return this.categories.get(categoryID);
  }

  getCategoryID(category: string): string {
    for (const [id, acat] of this.categories.entries()) {
      if (acat.parentID !== undefined) { continue }
      if (acat.name === category) {
        return String(id);
      }
    }
    throw new Error("Invalid category: " + category);
  }

  getAchievementID(category1: string, category2: string): string {
    const categoryID = this.getCategoryID(category1);

    for (const [id, acat] of this.categories.entries()) {
      if (acat.parentID === undefined) { continue }
      if (acat.name === category2 && String(acat.parentID) === categoryID) {
        return String(id);
      }
    }

    throw new Error("Invalid category/subcategory: " + category1 + "/" + category2);
  }

  getCategoryPair(category1: string, category2: string): string[] {
    const categoryID = this.getCategoryID(category1);

    for (const [id, acat] of this.categories.entries()) {
      if (acat.parentID === undefined) { continue }
      if (acat.name === category2 && String(acat.parentID) === categoryID) {
        return [categoryID, String(id)];
      }
    }

    throw new Error("Invalid category/subcategory: " + category1 + "/" + category2);
  }

  getClientIDsForAchievement(aid: string) {
    let data: number[] = [];
    //this.logger.log("getClientIDs(): aid:", aid);
    this.acaclients.get(aid)?.list.forEach((v) => {
      data.push(v.id);
    });
    return data;
  }

  getClients(ids: number[]) {
    let data: AchievementsClient[] = [];
    ids.forEach((id) => {
      const c = this.clients.get(id);
      if (c !== undefined) {
        data.push(c);
      }
    });
    return data;
  }

  getClientID(category1ID: string, category2ID: string, name: string): string {
    let clientID = "";

    const clientIDs = this.getClientIDsForAchievement(category2ID);
    for (const clientID of clientIDs) {
      const c = this.clients.get(clientID);
      if (c?.name === name) {
        return String(c.id);
      }
    }
    //this.logger.log('getClientID(%d, %d, "%s"): return: %d', category1ID, category2ID, name, clientID);
    return clientID;
  }

  getComponentID(category1ID: string, category2ID: string, clientID: string, component: string): string {
    let componentID = "";

    const ac = this.AchievementComponents.get(parseInt(clientID))?.find((ac) => ac.name === component);
    if (ac === undefined) {
      this.logger.log('getComponentID(%d, %d, %d, "%s") has no entry', category1ID, category2ID, clientID, component);
    }
    else {
      componentID = String(ac.id);
      //this.logger.log('getComponentID(%d, %d, %d, "%s") returns: %d', category1ID, category2ID, clientID, component, componentID);
    };

    return componentID;
  }

  getComponents(component: number) {
    return this.AchievementComponents.get(component);
  }

  makeMenuData() {
    const data = [];

    // Add the top level categories.
    for (const [id, category] of this.categories.entries()) {
      if (category.parentID !== undefined) { continue }
      data.push({
        'id': category.id,
        'name': category.name,
        'tooltip': category.text,
        'order': category.order,
        'children': [] as any
      });
    }

    // Add the sub-level categories.
    for (const [id, category] of this.categories.entries()) {
      if (category.parentID === undefined) { continue }
      data.find((item) => item.id == category.parentID)?.children.push({
        'id': category.id,
        'name': category.name,
        'tooltip': category.text,
        'order': category.order,
      });
    }

    return data;
  }

}
