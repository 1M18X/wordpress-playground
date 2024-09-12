import css from './style.module.css';
import {
	Button,
	Flex,
	FlexItem,
	Spinner,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import type { Field, View } from '@wordpress/dataviews';
import useFetch from '../../../lib/hooks/use-fetch';
import classNames from 'classnames';
import { useState } from 'react';
import { PlaygroundRoute, redirectTo } from '../../../lib/state/url/router';
import { joinPaths } from '@php-wasm/util';

type BlueprintsIndexEntry = {
	title: string;
	description: string;
	author: string;
	categories: string[];
	path: string;
};

export function BlueprintsPanel({
	className,
	mobileUi,
}: {
	className: string;
	mobileUi?: boolean;
}) {
	// @TODO: memoize across component loads
	const { data, isLoading, isError } = useFetch<
		Record<string, BlueprintsIndexEntry>
	>(
		'https://raw.githubusercontent.com/WordPress/blueprints/trunk/index.json'
	);

	const [view, setView] = useState<View>({
		type: 'list',
		fields: ['title', 'description', 'author', 'actions'],
	});

	const indexEntries: BlueprintsIndexEntry[] = data
		? Object.entries(data).map(([path, entry]) => ({ ...entry, path }))
		: [];

	const fields: Field<BlueprintsIndexEntry>[] = [
		{
			id: 'title',
			label: 'Title',
			enableHiding: false,
			render: ({ item }) => {
				return <h3>{item.title}</h3>;
			},
		},
		{
			id: 'description',
			label: 'Description',
			render: ({ item }) => {
				return <Text>{item.description}</Text>;
			},
		},
		{
			id: 'author',
			label: 'Author',
			render: ({ item }) => {
				return <Text>{item.author}</Text>;
			},
		},
		{
			id: 'actions',
			label: 'Actions',
			render: ({ item }) => {
				return (
					<Button
						variant="primary"
						onClick={() => {
							redirectTo(
								PlaygroundRoute.newTemporarySite({
									query: {
										'blueprint-url': joinPaths(
											'https://raw.githubusercontent.com/WordPress/blueprints/trunk/',
											item.path
										),
									},
								})
							);
						}}
					>
						Preview
					</Button>
				);
			},
		},
	];

	return (
		<section
			className={classNames(className, css.blueprintsPanel, {
				[css.isMobile]: mobileUi,
			})}
		>
			<Flex
				gap={8}
				direction="column"
				justify="flex-start"
				expanded={true}
			>
				<FlexItem className={css.padded}>
					<>
						<h2 className={css.sectionTitle}>
							Playground Blueprints
						</h2>
						<p>
							Let's explain what this section is all about here.
						</p>
					</>
				</FlexItem>
				<FlexItem
					style={{ alignSelf: 'stretch', overflowY: 'scroll' }}
					className={css.padded}
				>
					{isLoading ? (
						<Spinner />
					) : isError ? (
						<p>Error – TODO explain the details</p>
					) : (
						<DataViews<BlueprintsIndexEntry>
							data={indexEntries as BlueprintsIndexEntry[]}
							view={view}
							onChangeView={setView}
							isLoading={isLoading}
							fields={fields}
							getItemId={(item) => item.path}
							paginationInfo={{
								totalItems: indexEntries.length,
								totalPages: 1,
							}}
							defaultLayouts={{
								list: {},
							}}
						/>
					)}
				</FlexItem>
			</Flex>
		</section>
	);
}
