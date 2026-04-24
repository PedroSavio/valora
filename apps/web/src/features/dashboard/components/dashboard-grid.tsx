"use client";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./dashboard-grid.css";

import { GripVertical, LockKeyhole, RotateCcw, Unlock } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import RGL from "react-grid-layout";

type Layout = RGL.Layout;
type Layouts = RGL.Layouts;

const ResponsiveGridLayout = RGL.WidthProvider(RGL.Responsive);

const STORAGE_KEY = "valora:dashboard:layout:v3";
const BREAKPOINTS = { lg: 1280, md: 768, sm: 0 };
const COLS = { lg: 12, md: 8, sm: 4 };

export type DashboardGridItem = {
	id: string;
	node: ReactNode;
	minW?: number;
	minH?: number;
};

type Props = {
	items: DashboardGridItem[];
	defaultLayouts: Layouts;
};

function loadLayouts(): Layouts | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Layouts;
		return parsed;
	} catch {
		return null;
	}
}

function saveLayouts(layouts: Layouts) {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
	} catch {
		// ignore quota / disabled storage
	}
}

function reconcileLayouts(base: Layouts, stored: Layouts | null): Layouts {
	if (!stored) return base;
	const merged: Layouts = {};
	for (const bp of Object.keys(base) as (keyof Layouts)[]) {
		const baseBp = base[bp] ?? [];
		const storedBp = stored[bp] ?? [];
		const storedById = new Map(storedBp.map((l) => [l.i, l]));
		merged[bp] = baseBp.map((item) => storedById.get(item.i) ?? item);
	}
	return merged;
}

export function DashboardGrid({ items, defaultLayouts }: Props) {
	const [mounted, setMounted] = useState(false);
	const [editing, setEditing] = useState(false);
	const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);

	useEffect(() => {
		setLayouts(reconcileLayouts(defaultLayouts, loadLayouts()));
		setMounted(true);
	}, [defaultLayouts]);

	const onLayoutChange = useCallback(
		(_current: Layout[], all: Layouts) => {
			if (!mounted) return;
			setLayouts(all);
			saveLayouts(all);
		},
		[mounted],
	);

	const resetLayout = useCallback(() => {
		setLayouts(defaultLayouts);
		try {
			window.localStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore
		}
	}, [defaultLayouts]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-end gap-2">
				<button
					type="button"
					onClick={() => setEditing((value) => !value)}
					className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 font-medium text-sm transition-colors hover:bg-muted"
				>
					{editing ? (
						<>
							<Unlock className="size-4" />
							Concluir edição
						</>
					) : (
						<>
							<LockKeyhole className="size-4" />
							Personalizar
						</>
					)}
				</button>
				{editing ? (
					<button
						type="button"
						onClick={resetLayout}
						className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 font-medium text-sm transition-colors hover:bg-muted"
					>
						<RotateCcw className="size-4" />
						Resetar
					</button>
				) : null}
			</div>

			<div
				className={editing ? "dashboard-grid--editing" : undefined}
				style={{ minHeight: mounted ? undefined : 1200 }}
			>
				{mounted ? (
					<ResponsiveGridLayout
						className="layout"
						layouts={layouts}
						breakpoints={BREAKPOINTS}
						cols={COLS}
						rowHeight={30}
						margin={[20, 20]}
						containerPadding={[0, 0]}
						isDraggable={editing}
						isResizable={editing}
						draggableHandle=".dashboard-grid-handle"
						onLayoutChange={onLayoutChange}
						compactType="vertical"
					>
						{items.map((item) => (
							<div key={item.id} className="dashboard-grid-item">
								{editing ? (
									<div className="dashboard-grid-handle absolute top-2 right-2 z-10 flex size-7 cursor-grab items-center justify-center rounded-md border border-border bg-card/90 text-muted-foreground shadow-sm backdrop-blur active:cursor-grabbing">
										<GripVertical className="size-4" />
									</div>
								) : null}
								{item.node}
							</div>
						))}
					</ResponsiveGridLayout>
				) : null}
			</div>
		</div>
	);
}
