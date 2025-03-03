// multiple organization coontroller files include in one file 
import * as organizationControllers from './organization/organizationController.js';
import * as organizationUserControllers from './organization/organizationUsersController.js';

export {
  organizationControllers,
  organizationUserControllers,
};