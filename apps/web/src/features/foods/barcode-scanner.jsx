'use client';

import React from 'react';
import { HeartLoader } from '@/components/heart-loader';
import { Button, Input } from '@nourish/ui';
import { barcodeIsValid, barcodeProductToFood } from '@nourish/core';
import { Icon } from '@/components/icon';
import * as ZXingBrowser from '@zxing/browser';
export function BarcodeScanner({ onFound, onCreate, custom = [] }) {
  const [code, setCode] = React.useState(''),
    [status, setStatus] = React.useState('ready'),
    [error, setError] = React.useState(''),
    [camera, setCamera] = React.useState(false),
    [busy, setBusy] = React.useState(false),
    video = React.useRef(null),
    stream = React.useRef(null),
    controls = React.useRef(null),
    token = React.useRef(0),
    alive = React.useRef(true),
    abort = React.useRef(null),
    locked = React.useRef(false);
  function stop() {
    token.current++;
    controls.current?.stop();
    controls.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCamera(false);
  }
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      token.current++;
      controls.current?.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      abort.current?.abort();
    };
  }, []);
  async function lookup(value) {
    const barcode = String(value || code).trim();
    setCode(barcode);
    setError('');
    if (!barcodeIsValid(barcode)) {
      setError('Check the barcode digits and try again.');
      return;
    }
    stop();
    const saved = custom.find((food) => food.barcode === barcode);
    if (saved) {
      onFound(saved);
      return;
    }
    setBusy(true);
    setStatus('Looking up product…');
    const controller = new AbortController();
    abort.current?.abort();
    abort.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        'https://world.openfoodfacts.org/api/v2/product/' +
          barcode +
          '.json?fields=product_name,generic_name,brands,quantity,nutriments',
        {
          signal: controller.signal,
        },
      );
      if (!response.ok) throw Error('The food database is temporarily unavailable.');
      const data = await response.json();
      if (data.status !== 1)
        throw Error(
          'This barcode is not in the food database yet. You can create the food from its label.',
        );
      const food = barcodeProductToFood(data.product, barcode);
      if (alive.current) onFound(food);
    } catch (e) {
      if (alive.current) {
        setError(
          e.name === 'AbortError'
            ? 'The lookup timed out. Check your connection and try again.'
            : e.message,
        );
        setStatus('ready');
      }
    } finally {
      clearTimeout(timeout);
      if (alive.current) setBusy(false);
    }
  }
  async function start() {
    stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Camera access needs HTTPS and a supported browser. Try a barcode photo or enter the digits.',
      );
      return;
    }
    if (!ZXingBrowser) {
      setError('The scanner could not load. Enter the barcode digits below.');
      return;
    }
    setError('');
    setStatus('Opening camera…');
    setCamera(true);
    const run = ++token.current;
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment',
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });
      if (!alive.current || run !== token.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const reader = new ZXingBrowser.BrowserMultiFormatOneDReader();
      locked.current = false;
      setStatus('Hold the barcode inside the frame');
      const c = await reader.decodeFromStream(media, video.current, (result, err, ctl) => {
        if (result && !locked.current && alive.current && run === token.current) {
          const value = result.getText();
          if (!barcodeIsValid(value)) return;
          locked.current = true;
          ctl.stop();
          lookup(value);
        }
      });
      if (!alive.current || run !== token.current) c.stop();
      else controls.current = c;
    } catch (e) {
      if (alive.current && run === token.current) {
        stop();
        setError(
          e.name === 'NotAllowedError'
            ? 'Camera permission was not granted. You can use a photo or enter the barcode instead.'
            : e.name === 'NotFoundError'
              ? 'No camera found. Try a barcode photo or enter the number.'
              : 'Could not open the camera. Close other camera apps and try again.',
        );
        setStatus('ready');
      }
    }
  }
  async function photo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    stop();
    if (!ZXingBrowser) return setError('The scanner could not load. Enter the barcode instead.');
    setBusy(true);
    setError('');
    setStatus('Reading barcode photo…');
    const url = URL.createObjectURL(file);
    try {
      const reader = new ZXingBrowser.BrowserMultiFormatOneDReader();
      const result = await reader.decodeFromImageUrl(url);
      if (alive.current) await lookup(result.getText());
    } catch (e) {
      if (alive.current) {
        setError('No readable barcode found. Use a clear, straight photo of the full barcode.');
        setStatus('ready');
      }
    } finally {
      URL.revokeObjectURL(url);
      if (alive.current) setBusy(false);
      event.target.value = '';
    }
  }
  return (
    <div className="barcode-scanner">
      <p className="scanner-intro">Scan the barcode on your package to find its nutrition.</p>
      <div className={'scanner-view' + (camera ? ' is-live' : '')}>
        <video
          ref={video}
          muted={true}
          playsInline={true}
          autoPlay={true}
          aria-label="Barcode camera preview"
        />
        {!camera && (
          <div className="scanner-placeholder">
            <Icon type="Barcode" />
            <span>EAN / UPC barcodes</span>
          </div>
        )}
        {camera && <div className="scanner-frame" />}
      </div>
      {status !== 'ready' && (
        <div className="scanner-status" role="status">
          {busy || status === 'Opening camera…' ? <HeartLoader inline label={status} /> : status}
        </div>
      )}
      <div className="scanner-actions">
        <Button
          className="primary"
          disabled={busy}
          onClick={
            camera
              ? () => {
                  stop();
                  setStatus('ready');
                }
              : start
          }
          variant="unstyled"
        >
          {camera ? 'Stop camera' : 'Start camera'}
        </Button>
        <label className="photo-upload">
          <Icon type="Image" />
          Scan a photo
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={busy}
            onChange={photo}
            aria-label="Scan a barcode photo"
            unstyled
          />
        </label>
      </div>
      <div className="scanner-divider">or enter the number</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
      >
        <label htmlFor="barcode-digits">Barcode number</label>
        <Input
          id="barcode-digits"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 3017620422003"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          minLength={8}
          maxLength={14}
          required={true}
          unstyled
        />
        {error && (
          <p className="portion-error" role="alert">
            {error}
          </p>
        )}
        <Button className="primary" disabled={busy} variant="unstyled">
          {busy ? 'Looking up…' : 'Find food'}
        </Button>
      </form>
      {error && (
        <Button className="secondary" onClick={onCreate} variant="unstyled">
          Create food from label
        </Button>
      )}
      <p className="scanner-privacy">
        Camera images stay on your device. Only the barcode number is sent to Open Food Facts.
      </p>
    </div>
  );
}
