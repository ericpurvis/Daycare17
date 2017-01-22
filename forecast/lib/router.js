Router.route(Meteor.settings.public.appRootDir + '/forecast', {
  name: 'forecast',
  template: 'forecast',
  layoutTemplate: 'layout'
});
