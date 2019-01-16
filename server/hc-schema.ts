// a: Get number of notifications.
// Return> a > 0

const container = {
	hasNotifications: {
		type: GraphQLBoolean,
		async resolve({ id }) : boolean {
			let a : number = await (
				Notification.countDocuments({
					influenced: {
						$in: [str(id)]
					}
				})
			);

			return !!a;
		}
	}
}