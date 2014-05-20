module.exports = function(grunt) {
  grunt.initConfig({
    bump: {
      options: {
        files: ['package.json'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false
      }
    },
    'npm-publish': {
      options: {
        // list of tasks that are required before publishing
        requires: [],
        // if the workspace is dirty, abort publishing (to avoid publishing local changes)
        abortIfDirty: true,
      }
    }
  });

  grunt.loadNpmTasks('grunt-npm');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('release', function(arg) {
    if (arguments.length === 0) {
      arg = 'patch';
    }
    grunt.task.run([
      'bump:'+arg,
      'npm-publish'
    ]);
  });
  grunt.registerTask('default', []);

};
