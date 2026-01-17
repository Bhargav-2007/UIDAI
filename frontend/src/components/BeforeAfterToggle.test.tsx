import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import BeforeAfterToggle from './BeforeAfterToggle';

describe('BeforeAfterToggle Component', () => {
  // Cleanup after each test to prevent DOM pollution
  afterEach(() => {
    cleanup();
  });

  describe('Unit Tests', () => {
    describe('Toggle State Display', () => {
      it('should highlight "Before" button when value is "before"', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const beforeButton = screen.getByRole('button', { name: /before/i });
        const afterButton = screen.getByRole('button', { name: /after/i });

        // Before button should be highlighted (active state)
        expect(beforeButton).toHaveClass('bg-slate-600', 'text-slate-100');
        
        // After button should not be highlighted (inactive state)
        expect(afterButton).toHaveClass('bg-slate-700', 'text-slate-400');
      });

      it('should highlight "After" button when value is "after"', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="after"
            onChange={onChange}
          />
        );

        const beforeButton = screen.getByRole('button', { name: /before/i });
        const afterButton = screen.getByRole('button', { name: /after/i });

        // After button should be highlighted (active state)
        expect(afterButton).toHaveClass('bg-slate-600', 'text-slate-100');
        
        // Before button should not be highlighted (inactive state)
        expect(beforeButton).toHaveClass('bg-slate-700', 'text-slate-400');
      });

      it('should display both "Before" and "After" buttons', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        expect(screen.getByRole('button', { name: /before/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /after/i })).toBeInTheDocument();
      });
    });

    describe('Toggle Functionality', () => {
      it('should call onChange with "before" when Before button is clicked', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="after"
            onChange={onChange}
          />
        );

        const beforeButton = screen.getByRole('button', { name: /before/i });
        fireEvent.click(beforeButton);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('before');
      });

      it('should call onChange with "after" when After button is clicked', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const afterButton = screen.getByRole('button', { name: /after/i });
        fireEvent.click(afterButton);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('after');
      });

      it('should call onChange when clicking the currently active button', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const beforeButton = screen.getByRole('button', { name: /before/i });
        fireEvent.click(beforeButton);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith('before');
      });

      it('should handle multiple rapid clicks correctly', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const beforeButton = screen.getByRole('button', { name: /before/i });
        const afterButton = screen.getByRole('button', { name: /after/i });

        // Click multiple times rapidly
        fireEvent.click(afterButton);
        fireEvent.click(beforeButton);
        fireEvent.click(afterButton);

        expect(onChange).toHaveBeenCalledTimes(3);
        expect(onChange).toHaveBeenNthCalledWith(1, 'after');
        expect(onChange).toHaveBeenNthCalledWith(2, 'before');
        expect(onChange).toHaveBeenNthCalledWith(3, 'after');
      });
    });

    describe('Active State Highlighting', () => {
      it('should correctly highlight active state when value changes', () => {
        const onChange = vi.fn();

        const { rerender } = render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        let beforeButton = screen.getByRole('button', { name: /before/i });
        let afterButton = screen.getByRole('button', { name: /after/i });

        // Initially "before" should be active
        expect(beforeButton).toHaveClass('bg-slate-600', 'text-slate-100');
        expect(afterButton).toHaveClass('bg-slate-700', 'text-slate-400');

        // Change to "after"
        rerender(
          <BeforeAfterToggle
            value="after"
            onChange={onChange}
          />
        );

        beforeButton = screen.getByRole('button', { name: /before/i });
        afterButton = screen.getByRole('button', { name: /after/i });

        // Now "after" should be active
        expect(afterButton).toHaveClass('bg-slate-600', 'text-slate-100');
        expect(beforeButton).toHaveClass('bg-slate-700', 'text-slate-400');
      });

      it('should maintain consistent styling for inactive buttons', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const afterButton = screen.getByRole('button', { name: /after/i });

        // Inactive button should have consistent styling
        expect(afterButton).toHaveClass('bg-slate-700', 'text-slate-400', 'hover:text-slate-100');
      });

      it('should maintain consistent styling for active buttons', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const beforeButton = screen.getByRole('button', { name: /before/i });

        // Active button should have consistent styling
        expect(beforeButton).toHaveClass('bg-slate-600', 'text-slate-100');
      });
    });

    describe('Component Structure', () => {
      it('should render with proper container styling', () => {
        const onChange = vi.fn();

        const { container } = render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const toggleContainer = container.firstChild as HTMLElement;
        expect(toggleContainer).toHaveClass(
          'flex',
          'items-center',
          'gap-2',
          'mb-4',
          'bg-slate-800',
          'p-2',
          'rounded',
          'border',
          'border-slate-600',
          'w-fit'
        );
      });

      it('should include visual separator between buttons', () => {
        const onChange = vi.fn();

        const { container } = render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const separator = container.querySelector('.w-px.h-6.bg-slate-600');
        expect(separator).toBeInTheDocument();
      });

      it('should have proper button styling classes', () => {
        const onChange = vi.fn();

        render(
          <BeforeAfterToggle
            value="before"
            onChange={onChange}
          />
        );

        const beforeButton = screen.getByRole('button', { name: /before/i });
        const afterButton = screen.getByRole('button', { name: /after/i });

        // Both buttons should have common styling
        [beforeButton, afterButton].forEach(button => {
          expect(button).toHaveClass(
            'px-3',
            'py-1',
            'rounded',
            'text-sm',
            'font-semibold',
            'transition'
          );
        });
      });
    });
  });
});