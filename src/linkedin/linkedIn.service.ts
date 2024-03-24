import { HttpException, Injectable } from '@nestjs/common';
import { Builder, By, Key, WebDriver, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

@Injectable()
export class LinkedInService {
  private driver: WebDriver;

  constructor() {
    this.initDriver();
  }

  async initDriver() {
    try {
      const options = new chrome.Options();

      // options.addArguments('--headless');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      options.addArguments('--user-data-dir=/tmp/chrome-user-data');
      options.addArguments('--user-data-dir=/path/to/new/user/profile');

      this.driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async extractProfileData(profileUrl: string) {
    if (!profileUrl) throw new HttpException('Profile Url not found', 404);

    if (!(await this.isDriverAlive())) await this.initDriver();

    await this.driver.get(profileUrl);

    const currentUrl = await this.driver.getCurrentUrl();
    if (currentUrl !== profileUrl) {
      this.extractProfileData(profileUrl);
    }

    let name = '',
      role = '',
      imageSrc = '';

    const NAME_ELEMENT = 'head meta[property="profile:first_name"]';

    const IMAGE_ELEMENT = 'head meta[name="twitter:image"]';

    const ROLE_ELEMENT =
      'div > div.top-card-layout__entity-info-container.flex.flex-wrap.papabear\\:flex-nowrap > div:nth-child(1) > h2';

    try {
      await this.driver.wait(until.elementLocated(By.css(NAME_ELEMENT)), 30000);
      name = await this.driver
        .findElement(By.css(NAME_ELEMENT))
        .getAttribute('content');

      await this.driver.wait(until.elementLocated(By.css(ROLE_ELEMENT)), 30000);
      role = await this.driver.findElement(By.css(ROLE_ELEMENT)).getText();

      await this.driver.wait(
        until.elementLocated(By.css(IMAGE_ELEMENT)),
        30000,
      );
      imageSrc = await this.driver
        .findElement(By.css(IMAGE_ELEMENT))
        .getAttribute('content');

      // await this.driver.quit();
    } catch (error) {
      // throw new HttpException(error.message, error.status);
    }
    return { name, role, imageSrc };
  }

  async clearData() {
    await this.driver.manage().deleteAllCookies();
    await this.driver.executeScript('window.localStorage.clear();');
    await this.driver.executeScript('window.sessionStorage.clear();');
    await this.driver.get('chro.me://settings/clearBrowserData');
    await this.driver.findElement(By.id('#clearBrowsingDataConfirm')).click();
  }

  async isDriverAlive() {
    try {
      await this.driver.getSession();
      return true; // The driver is alive
    } catch (error) {
      return false; // The driver is not alive or disconnected
    }
  }
}
