import { BaseMiddleware } from './BaseMiddleware.js';

class CampaignsMiddleware extends BaseMiddleware {
  constructor() {
    super('campaign.json');
  }
}

export const campaigns = new CampaignsMiddleware();
