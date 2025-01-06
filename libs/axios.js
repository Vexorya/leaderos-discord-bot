const axios = require('axios');
const config = require('../config.js');
const logger = require('../utils/logger.js');

// Create axios instance
const instance = axios.create({
  baseURL: config.websiteUrl,
  headers: {
    'X-API-KEY': config.apiKey,
  },
});

instance.interceptors.request.use((request) => {
  logger('Request => ' + JSON.stringify(request, null, 2));
  return request;
});

instance.interceptors.response.use((response) => {
  logger(
    `Response => \nCode: ${response.status}\nData: ` +
      JSON.stringify(response.data, null, 2)
  );
  return response;
});

// Get settings
module.exports.getSettings = async () => {
  const { data } = await instance.get('/api/integrations/discord/settings');
  return data;
};

// Get user data
module.exports.getUserInfo = async (discordUserID) => {
  const { data } = await instance.get(
    `/api/integrations/discord/users/${discordUserID}`
  );
  return data;
};

// Get user roles
module.exports.getUserRoles = async (userID) => {
  const { data } = await instance.get(`/api/users/${userID}/roles`);
  return data;
};

// Get roles
module.exports.getRoles = async () => {
  const { data } = await instance.get(`/api/integrations/discord/roles`);
  return data;
};
