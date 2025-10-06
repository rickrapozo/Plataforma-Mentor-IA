// Simple AudioWorkletProcessor that forwards input audio frames to the main thread.
// It posts Float32Array chunks for the first channel of the first input.
// Encoding to PCM and transport happens on the main thread.
class RecorderWorkletProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      // Post the audio frame (Float32Array)
      this.port.postMessage(input[0]);
    }
    // Keep processor alive
    return true;
  }
}

registerProcessor('recorder-worklet', RecorderWorkletProcessor);