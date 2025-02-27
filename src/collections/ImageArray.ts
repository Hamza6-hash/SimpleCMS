import widgets from '@src/components/widgets';
import { roles } from './types';
import type { Schema } from './types';

const schema: Schema = {
	// Collection Name comming from filename

	// Optional & Icon , status, slug
	// See for possible Icons https://icon-sets.iconify.design/
	icon: 'bi:images',

	// Collection Permissions by user Roles

	// Defined Fields that are used in Collection
	// Widget fields can be inspected for individual options
	fields: [
		widgets.ImageArray({
			label: 'ImageArray',
			uploader_path: 'images',
			uploader_label: 'image',

			fields: [
				widgets.Text({
					label: 'title',
					db_fieldName: 'title',
					translated: false
				}),
				widgets.Text({
					label: 'Alt Text',
					db_fieldName: 'alt',
					placeholder: 'Enter Alt Text',
					required: true
				})
			]
		})
	]
};
export default schema;
