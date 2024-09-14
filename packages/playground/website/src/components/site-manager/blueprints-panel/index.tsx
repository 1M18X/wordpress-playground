import css from './style.module.css';
import {
	Button,
	Flex,
	FlexItem,
	Spinner,
	__experimentalText as Text,
	__experimentalVStack as VStack,
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
		fields: ['header', 'description', 'actions'],
	});

	let indexEntries: BlueprintsIndexEntry[] = data
		? Object.entries(data).map(([path, entry]) => ({ ...entry, path }))
		: [];

	if (view.search) {
		indexEntries = indexEntries.filter((entry) => {
			return [entry.title, entry.description]
				.join(' ')
				.toLocaleLowerCase()
				.includes(view.search!.toLocaleLowerCase());
		});
	}

	function previewBlueprint(blueprintPath: BlueprintsIndexEntry['path']) {
		redirectTo(
			PlaygroundRoute.newTemporarySite({
				query: {
					'blueprint-url': joinPaths(
						'https://raw.githubusercontent.com/WordPress/blueprints/trunk/',
						blueprintPath
					),
				},
			})
		);
	}

	const fields: Field<BlueprintsIndexEntry>[] = [
		{
			id: 'header',
			label: 'Header',
			enableHiding: false,
			render: ({ item }) => {
				return (
					<VStack spacing={0}>
						<h3 className={css.blueprintTitle}>{item.title}</h3>
						<Text>
							By{' '}
							<a
								target="_blank"
								rel="noreferrer"
								href={`https://github.com/${item.author}`}
							>
								{item.author}
							</a>
						</Text>
					</VStack>
				);
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
			id: 'actions',
			label: 'Actions',
			render: ({ item }) => {
				// Action handled by onChangeSelection
				return <Button variant="primary">Preview</Button>;
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
				<FlexItem style={{ alignSelf: 'stretch', overflowY: 'scroll' }}>
					<div className={css.padded}>
						{isLoading ? (
							<Spinner />
						) : isError ? (
							<p>Error – TODO explain the details</p>
						) : (
							<DataViews<BlueprintsIndexEntry>
								data={indexEntries as BlueprintsIndexEntry[]}
								view={view}
								onChangeView={setView}
								onChangeSelection={(newSelection) => {
									if (newSelection?.length) {
										previewBlueprint(newSelection[0]);
									}
								}}
								search={true}
								isLoading={isLoading}
								fields={fields}
								header={null}
								getItemId={(item) => item?.path}
								paginationInfo={{
									totalItems: indexEntries.length,
									totalPages: 1,
								}}
								defaultLayouts={{
									list: {},
								}}
							/>
						)}
					</div>
				</FlexItem>
			</Flex>
		</section>
	);
}
