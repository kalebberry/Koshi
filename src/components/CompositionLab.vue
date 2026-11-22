<script setup lang="ts">
import { computed, ref } from 'vue';
import {
	generateCompositions,
	getCategoryCounts,
	studySignature,
	type AspectRatio,
	type Block,
	type CompositionCategory,
} from '../lib/compositions';
import { exportBoth, exportCSS, exportHTML } from '../lib/export';

// -----------------------------------------------------------------------------
// Reactive State
// -----------------------------------------------------------------------------

const batch = ref(0);
const selected = ref(0);
const activeCategory = ref<CompositionCategory>('all');
const previewWidth = ref(960);
const showCode = ref(false);
const showContent = ref(true);
const showDebug = ref(false);
const gap = ref(20);
const copied = ref('');

// -----------------------------------------------------------------------------
// Computed Properties
// -----------------------------------------------------------------------------

const categories = computed(() => getCategoryCounts());
const studies = computed(() =>
	generateCompositions(batch.value, activeCategory.value, 12)
);
const active = computed(() => studies.value[selected.value] ?? studies.value[0]!);
const generatedCode = computed(() => (active.value ? exportHTML(active.value) : ''));

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function setCategory(cat: CompositionCategory) {
	activeCategory.value = cat;
	batch.value = 0;
	selected.value = 0;
	showCode.value = false;
	copied.value = '';
}

function regenerate() {
	batch.value += 1;
	selected.value = 0;
	showCode.value = false;
	copied.value = '';
}

function selectStudy(index: number) {
	selected.value = index;
	showCode.value = false;
}

function kindClass(block: Block) {
	const parts = ['block--' + block.kind];
	if (block.height) {
		parts.push('block--' + block.height);
	}
	if (block.ratio) {
		parts.push('block--ratio-' + block.ratio.replace('/', '-'));
	}
	if (block.subgrid) {
		parts.push('block--subgrid');
	}
	return parts.join(' ');
}

function ratioLabel(ratio: AspectRatio): string {
	switch (ratio) {
		case '16/9':
			return '16 : 9 Cinema';
		case '4/3':
			return '4 : 3 Standard';
		case '1/1':
			return '1 : 1 Square';
		case 'golden':
			return '1 : 1.618 Golden';
		case 'silver':
			return '1 : 1.414 Hakugin-hi';
		case '3/4':
			return '3 : 4 Portrait';
		default:
			return ratio;
	}
}

async function copy(type: 'html' | 'css' | 'both') {
	if (!active.value) return;
	const content =
		type === 'html'
			? exportHTML(active.value)
			: type === 'css'
				? exportCSS
				: exportBoth(active.value);
	try {
		await navigator.clipboard.writeText(content);
		copied.value = type;
	} catch {
		showCode.value = true;
		copied.value = 'unavailable';
	}
}
</script>

<template>
	<div class="lab-shell">
		<!-- Hero Section -->
		<section class="hero">
			<span class="overline">Layout Archetype Engine</span>
			<h1>
				Explore the space
				<br />
				<em>between elements.</em>
			</h1>
			<p>
				Production-ready editorial, hero, subgrid, and ratio compositions. Built on twelve harmonized
				fractional tracks to scaffold client websites and landing pages in seconds.
			</p>
		</section>

		<!-- Section 01: The Studies -->
		<div class="section-heading">
			<div>
				<span class="overline">01 / THE STUDIES</span>
				<h2>Compositions</h2>
			</div>
			<button class="button button--primary" type="button" @click="regenerate">
				↻
				<span>Shuffle set</span>
			</button>
		</div>

		<!-- Category Filter Tabs -->
		<div class="category-filter-bar" role="tablist" aria-label="Composition archetypes">
			<button
				v-for="cat in categories"
				:key="cat.id"
				type="button"
				class="category-pill"
				:class="{ 'category-pill--active': activeCategory === cat.id }"
				role="tab"
				:aria-selected="activeCategory === cat.id"
				@click="setCategory(cat.id)"
			>
				{{ cat.label }}
				<span class="category-count">{{ cat.count }}</span>
			</button>
		</div>

		<!-- Studies Gallery Grid -->
		<section class="gallery" aria-label="Composition studies">
			<button
				v-for="(study, index) in studies"
				:key="study.id"
				class="study-card"
				:class="{ 'study-card--selected': selected === index }"
				type="button"
				:aria-pressed="selected === index"
				@click="selectStudy(index)"
			>
				<div class="card-meta">
					<span>STUDY {{ String(index + 1).padStart(2, '0') }}</span>
					<span class="card-category-tag">{{ study.categoryLabel }}</span>
					<span class="card-indicator">{{ selected === index ? '●' : '↗' }}</span>
				</div>
				<div class="study-sketch" aria-hidden="true">
					<div
						v-for="(row, rowIndex) in study.rows"
						:key="rowIndex"
						class="kos-grid"
						kos-cols="12"
					>
						<div
							v-for="(block, blockIndex) in row"
							:key="blockIndex"
							class="sketch-block"
							:class="'sketch-block--' + block.kind"
							:kos-col-span="block.span"
							:kos-offset="block.offset || undefined"
						>
							<template v-if="block.kind === 'text'">
								<i></i>
								<i></i>
								<i></i>
							</template>
							<template v-else-if="block.kind === 'card'">
								<div class="sketch-card-lines">
									<b class="s-tag"></b>
									<b class="s-title"></b>
									<b class="s-desc"></b>
								</div>
							</template>
							<template v-else-if="block.kind === 'stat'">
								<span class="sketch-stat">99%</span>
							</template>
							<template v-else-if="block.kind === 'image'">
								<span v-if="block.ratio" class="sketch-ratio">{{ block.ratio }}</span>
								<span v-else>▧</span>
							</template>
							<span v-else-if="block.kind === 'quote'">“ ”</span>
						</div>
					</div>
				</div>
				<div class="card-caption">
					<strong>{{ study.title }}</strong>
					<span>{{ studySignature(study) }}</span>
				</div>
			</button>
		</section>

		<!-- Section 02: Selected Composition Detail -->
		<section v-if="active" class="detail" aria-labelledby="detail-title">
			<div class="section-heading section-heading--detail">
				<div>
					<span class="overline">02 / SELECTED COMPOSITION · {{ active.categoryLabel }}</span>
					<h2 id="detail-title">{{ active.title }}</h2>
					<p class="study-description">{{ active.description }}</p>
				</div>
				<span class="detail-counter">
					{{ String(selected + 1).padStart(2, '0') }}
					<span>/ {{ String(studies.length).padStart(2, '0') }}</span>
				</span>
			</div>

			<!-- Preview Control Bar -->
			<div class="control-bar">
				<label class="width-label" for="preview-width">
					Preview width
					<output for="preview-width">{{ previewWidth }}px</output>
				</label>
				<input
					id="preview-width"
					v-model.number="previewWidth"
					class="width-slider"
					type="range"
					min="320"
					max="1200"
					step="10"
					aria-label="Composition preview width in pixels"
				/>
				<button type="button" class="width-reset" @click="previewWidth = 960">Reset</button>
				<label class="switch-label">
					<input v-model="showContent" type="checkbox" />
					Sample content
				</label>
				<label class="switch-label">
					<input v-model="showDebug" type="checkbox" />
					Lattice guides (kos-debug)
				</label>
				<label class="gap-label">
					Gap
					<input v-model.number="gap" type="range" min="8" max="40" step="4" />
					<output>{{ gap }}px</output>
				</label>
			</div>

			<!-- Interactive Preview Stage -->
			<div class="preview-stage">
				<div
					class="preview-canvas"
					:style="{ '--preview-width': previewWidth + 'px' }"
				>
					<div class="preview-paper">
						<div class="preview-mast">
							<span>格子 / KŌSHI 2.0 · {{ active.categoryLabel.toUpperCase() }}</span>
							<span>STUDY {{ String(selected + 1).padStart(2, '0') }} · {{ active.signature }}</span>
						</div>
						<div
							class="kos-composition"
							:kos-debug="showDebug ? '' : undefined"
							:style="{ '--kos-gutter': gap + 'px' }"
						>
							<div
								v-for="(row, rowIndex) in active.rows"
								:key="rowIndex"
								class="kos-grid"
								kos-cols="12"
							>
								<div
									v-for="(block, blockIndex) in row"
									:key="blockIndex"
									class="preview-block"
									:class="kindClass(block)"
									:kos-col-span="block.span"
									:kos-row-span="block.rowSpan || undefined"
									:kos-ratio="block.ratio || undefined"
									:kos-subgrid="block.subgrid || undefined"
									:kos-offset="block.offset || undefined"
								>
									<template v-if="showContent">
										<!-- Subgrid Card -->
										<template v-if="block.kind === 'card'">
											<div class="sample-card" :kos-subgrid="block.subgrid || undefined">
												<span class="card-eyebrow">{{ block.cardData?.eyebrow || 'Feature ' + (blockIndex + 1) }}</span>
												<h4 class="card-title">{{ block.cardData?.title || block.title || 'Harmonized Track' }}</h4>
												<p class="card-desc">{{ block.cardData?.description || block.text || 'Card body copy snaps to shared row tracks across columns.' }}</p>
												<div class="card-action">
													<span class="card-link">{{ block.cardData?.cta || 'Explore Specimen →' }}</span>
												</div>
											</div>
										</template>

										<!-- Image with Ratio -->
										<template v-else-if="block.kind === 'image'">
											<div class="sample-image">
												<span v-if="block.ratio" class="sample-image__badge">{{ ratioLabel(block.ratio) }}</span>
												<span class="sample-image__title">{{ block.title || 'VISUAL / MEDIA' }}</span>
											</div>
										</template>

										<!-- Key Stat -->
										<template v-else-if="block.kind === 'stat'">
											<div class="sample-stat">
												<div class="sample-stat__val">{{ block.statData?.value || '99.4%' }}</div>
												<div class="sample-stat__label">{{ block.statData?.label || block.title || 'Metric' }}</div>
												<small v-if="block.statData?.note" class="sample-stat__note">{{ block.statData.note }}</small>
											</div>
										</template>

										<!-- Quote -->
										<template v-else-if="block.kind === 'quote'">
											<div class="sample-quote">
												<p>“{{ block.quote || 'Space is not emptiness; it is the structure that gives form meaning.' }}”</p>
												<cite v-if="block.author">— {{ block.author }}</cite>
											</div>
										</template>

										<!-- Text -->
										<template v-else-if="block.kind === 'text'">
											<div class="sample-copy">
												<span class="overline">{{ block.subtitle || 'Editorial study' }}</span>
												<h3>{{ block.title || 'Space shapes the story.' }}</h3>
												<p>{{ block.text || 'Every composition begins with proportion, rhythm, and a considered relationship between elements.' }}</p>
											</div>
										</template>
									</template>

									<!-- Wireframe Mode -->
									<template v-else-if="block.kind !== 'space'">
										<div class="wire-block-inner">
											<span class="wire-label">{{ block.span }} / 12</span>
											<span v-if="block.ratio" class="wire-tag">{{ block.ratio }}</span>
											<span v-else-if="block.subgrid" class="wire-tag">subgrid</span>
											<span v-else-if="block.rowSpan" class="wire-tag">row-span {{ block.rowSpan }}</span>
										</div>
									</template>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Section 03: Export Bar -->
			<div class="export-bar">
				<div>
					<span class="overline">03 / TAKE IT TO PRODUCTION</span>
					<p>Copy the Kōshi structure and drop it straight into your client project or template.</p>
				</div>
				<div class="export-buttons">
					<button type="button" class="button" @click="showCode = !showCode">
						{{ showCode ? 'Hide code' : 'View HTML' }}
					</button>
					<button type="button" class="button" @click="copy('html')">
						{{ copied === 'html' ? 'HTML copied ✓' : 'Copy HTML' }}
					</button>
					<button type="button" class="button" @click="copy('css')">
						{{ copied === 'css' ? 'CSS copied ✓' : 'Copy CSS' }}
					</button>
					<button type="button" class="button button--primary" @click="copy('both')">
						{{ copied === 'both' ? 'Both copied ✓' : 'Copy HTML + CSS' }}
					</button>
				</div>
			</div>

			<!-- Code Display Panel -->
			<pre v-if="showCode" class="code-panel"><code>{{ generatedCode }}</code></pre>

			<p v-if="copied === 'unavailable'" class="copy-note">
				Clipboard access was not available. Copy the markup from the panel above.
			</p>
		</section>
	</div>
</template>
