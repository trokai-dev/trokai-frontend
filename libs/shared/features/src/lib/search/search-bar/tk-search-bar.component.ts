import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  Filters,
  NavbarItem,
  SearchHistoryEntry,
  SearchSuggestion,
  SearchSuggestionsViewModel,
} from '@trokai/shared-core';
import { CatalogService, SearchHistoryService } from '@trokai/shared-data-access';

export interface SearchRequest {
  filters: Filters;
  scope: 'clothes' | 'vendors';
}

/**
 * Shared search bar: owns text state, category/vendor suggestions, recent-search
 * history and the empty-state nav links. Renders the same internal panel either
 * inside a cdk-overlay anchored dropdown (web desktop, `expanded=false`) or
 * inline filling the host (web mobile dialog / app search page, `expanded=true`).
 * Never navigates itself — emits `searchRequested` so each platform host
 * navigates with its own platform-correct route/mechanism.
 */
@Component({
  selector: 'tk-search-bar',
  standalone: true,
  imports: [
    FormsModule,
    OverlayModule,
    NgTemplateOutlet,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './tk-search-bar.component.html',
  styleUrl: './tk-search-bar.component.scss',
})
export class TkSearchBarComponent implements OnInit, OnChanges {
  /** App: always true (the page already is the full surface). Web: true only inside TkSearchDialogComponent. */
  @Input() expanded = false;
  /** Dynamic category/menu data — same shape the app's search page already renders. Passed down from the host's own per-app global/init service. */
  @Input() navMenu: NavbarItem[] | null = null;
  @Input() initialText = '';
  /** When true, never render the suggestions/history panel even if `expanded` — for hosts (e.g. the app's inline search page) that need to show their own results below the bar instead. */
  @Input() collapsed = false;

  @Output() textChange = new EventEmitter<string>();
  @Output() searchRequested = new EventEmitter<SearchRequest>();
  @Output() dismiss = new EventEmitter<void>();

  private catalog = inject(CatalogService);
  private historyService = inject(SearchHistoryService);

  query = '';
  focused = false;
  history: SearchHistoryEntry[] = [];
  suggestions: SearchSuggestionsViewModel | null = null;

  get panelOpen(): boolean {
    if (this.collapsed) return false;
    if (this.expanded) return true;
    // Desktop overlay: only pop up once there's something to show suggestions for.
    return this.focused && this.query.trim().length > 0;
  }

  ngOnInit(): void {
    this.query = this.initialText;
    this.loadHistory();
  }

  /** Keeps `query` in sync when a host updates `initialText` after init (e.g. a deep link pre-filling text on an already-mounted bar). */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialText'] && !changes['initialText'].isFirstChange()) {
      this.query = this.initialText;
    }
  }

  async loadHistory(): Promise<void> {
    this.history = await this.historyService.getAll();
  }

  onFocus(): void {
    this.focused = true;
  }

  onEscape(): void {
    this.focused = false;
    this.dismiss.emit();
  }

  onBackdropClick(): void {
    this.focused = false;
    this.dismiss.emit();
  }

  onInput(): void {
    this.textChange.emit(this.query);
    const text = this.query.trim();
    this.suggestions = text ? this.buildSuggestions(text) : null;
  }

  clearQuery(): void {
    this.query = '';
    this.suggestions = null;
    this.textChange.emit(this.query);
  }

  private buildSuggestions(query: string): SearchSuggestionsViewModel {
    const categories = this.catalog.getItemsMapValue()?.category ?? [];

    return {
      query,
      categories: categories.map((c) => ({
        kind: 'category',
        query,
        categoryId: c._id,
        categoryLabel: c.value,
        label: `${query} em ${c.value}`,
      })),
      vendors: { kind: 'vendors', query, label: `${query} em Vendedores` },
    };
  }

  async selectSuggestion(s: SearchSuggestion): Promise<void> {
    if (s.kind === 'vendors') {
      await this.historyService.add({ query: s.query, vendors: true });
      this.dispatch(new Filters({ text: s.query }), 'vendors');
    } else {
      await this.historyService.add({
        query: s.query,
        categoryId: s.categoryId,
        categoryLabel: s.categoryLabel,
      });
      this.dispatch(
        new Filters({ text: s.query, category: s.categoryId }),
        'clothes',
      );
    }
  }

  async onEnter(): Promise<void> {
    const text = this.query.trim();
    if (!text) return;

    await this.historyService.add({ query: text });
    this.dispatch(new Filters({ text }), 'clothes');
  }

  async selectHistoryEntry(h: SearchHistoryEntry): Promise<void> {
    await this.historyService.add({
      query: h.query,
      categoryId: h.categoryId,
      categoryLabel: h.categoryLabel,
      vendors: h.vendors,
    });
    this.dispatch(
      new Filters({ text: h.query, category: h.categoryId ?? undefined }),
      h.vendors ? 'vendors' : 'clothes',
    );
  }

  async clearHistory(): Promise<void> {
    await this.historyService.clear();
    this.history = [];
  }

  /** Mirrors the app's former `selectInitialCat()` — nav items/cols carry their own Filters-shaped `params`. */
  selectNavLink(item: { params?: Partial<Filters> }): void {
    this.dispatch(new Filters({ ...item.params }), 'clothes');
  }

  private dispatch(filters: Filters, scope: 'clothes' | 'vendors'): void {
    this.focused = false;
    this.searchRequested.emit({ filters, scope });
  }
}
