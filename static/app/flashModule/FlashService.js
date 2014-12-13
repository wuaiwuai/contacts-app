// FlashService emulates server side flash messaging
flashModule.factory('FlashService', ['$rootScope',
	function($rootScope){

		// set message queue and current message; when route
		// changes complete, current message gets first message
		// in queue or nothing if there is nothing left
		var queue = [];
		var currentMessage = '';

		$rootScope.$on('$locationChangeSuccess', function(){
			currentMessage = queue.shift() || '';
		});

		// public methods
		// Note: because on success we expect route to change
		// whereas on error we expect route to stay the same,
		// setMessage will show after one route change and
		// showMessage will add message immediately
		return {
			setMessage: function(message){
				queue.push(message);
			},
			showMessage: function(message){
				currentMessage = message;
			},
			getMessage: function(){
				return currentMessage;
			}
		};
	}
]);