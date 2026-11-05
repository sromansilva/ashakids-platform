import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioDecibelMeter } from '@/shared/presentation/components/common/AudioDecibelMeter';
import { MLServiceUnavailableBanner } from '@/shared/presentation/components/common/MLServiceUnavailableBanner';

describe('AudioDecibelMeter Component', () => {
  it('renders inactive state when recording is false', () => {
    render(<AudioDecibelMeter recording={false} label="Nivel del micrófono" />);
    const meter = screen.getByRole('meter', { name: /nivel del micrófono/i });
    expect(meter).toBeInTheDocument();
    expect(screen.getByText(/inactivo/i)).toBeInTheDocument();
    expect(screen.getByText(/-- db/i)).toBeInTheDocument();
  });

  it('renders active recording state and adapts gracefully without native AudioContext', () => {
    render(<AudioDecibelMeter recording={true} label="Nivel sonoro capturado" />);
    const meter = screen.getByRole('meter', { name: /nivel sonoro capturado/i });
    expect(meter).toBeInTheDocument();
    expect(screen.getByText(/escuchando ráfaga/i)).toBeInTheDocument();
  });
});

describe('MLServiceUnavailableBanner Component', () => {
  it('does not render when visible is false', () => {
    const { container } = render(<MLServiceUnavailableBanner visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders friendly explanation when visible is true', () => {
    render(
      <MLServiceUnavailableBanner
        visible={true}
        title="Servicio de IA Fonológica en Pausa Temporal"
      />
    );
    expect(screen.getByText(/servicio de ia fonológica en pausa temporal/i)).toBeInTheDocument();
    expect(screen.getByText(/atención clínica ininterrumpida/i)).toBeInTheDocument();
    expect(screen.getByText(/reporte manual habilitado/i)).toBeInTheDocument();
  });

  it('triggers onRetry and onDismiss callbacks properly', () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();
    render(
      <MLServiceUnavailableBanner
        visible={true}
        onRetry={onRetry}
        onDismiss={onDismiss}
      />
    );
    const retryBtn = screen.getByRole('button', { name: /reintentar conexión/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole('button', { name: /cerrar aviso/i });
    fireEvent.click(closeBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

