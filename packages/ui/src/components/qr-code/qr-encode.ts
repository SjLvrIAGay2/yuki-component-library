/**
 * 轻量二维码编码器（Model 2，数字、字母数字与 Byte 模式，版本 1–40，纠错等级 L/M/Q/H）。
 *
 * 该文件刻意保持无依赖、无副作用：仅把字符串编码为布尔模块矩阵，
 * 由 QRCode 组件负责渲染。实现遵循 ISO/IEC 18004 的标准流程：
 * 数据码字 → Reed-Solomon 纠错 → 交错 → 掩码择优 → 功能图形绘制。
 */

export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H';

const ECC_CODEWORDS_PER_BLOCK: Record<QRCodeErrorLevel, readonly number[]> = {
  L: [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};

const NUM_ERROR_CORRECTION_BLOCKS: Record<QRCodeErrorLevel, readonly number[]> = {
  L: [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

const MIN_VERSION = 1;
const MAX_VERSION = 40;
const ECL_FORMAT_BITS: Record<QRCodeErrorLevel, number> = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

export interface QRCodeMatrix {
  /** 版本号（1–40）。 */
  version: number;
  /** 每行模块数。 */
  size: number;
  /** `modules[y][x]` 为 true 表示深色模块。 */
  modules: boolean[][];
  /** 实际使用的纠错等级。 */
  level: QRCodeErrorLevel;
}

function eccCodewordsPerBlock(
  version: number,
  level: QRCodeErrorLevel,
): number {
  return ECC_CODEWORDS_PER_BLOCK[level]![version - 1]!;
}

function numErrorCorrectionBlocks(
  version: number,
  level: QRCodeErrorLevel,
): number {
  return NUM_ERROR_CORRECTION_BLOCKS[level]![version - 1]!;
}

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}

/** 该版本可容纳的原始码字数（含纠错码字）。 */
function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(version: number, level: QRCodeErrorLevel): number {
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  return (
    rawCodewords -
    eccCodewordsPerBlock(version, level) *
      numErrorCorrectionBlocks(version, level)
  );
}

function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) return [];
  const numAlign = Math.floor(version / 7) + 2;
  const step =
    version === 32
      ? 26
      : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result: number[] = [6];
  for (let pos = version * 4 + 10; result.length < numAlign; pos -= step) {
    result.splice(1, 0, pos);
  }
  return result;
}

/* ---------- GF(256) 与 Reed-Solomon ---------- */

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonComputeDivisor(degree: number): Uint8Array {
  const result = new Uint8Array(degree);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] =
        gfMultiply(result[j] ?? 0, root) ^ (result[j + 1] ?? 0);
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonComputeRemainder(
  data: readonly number[],
  divisor: Uint8Array,
): Uint8Array {
  const result = new Uint8Array(divisor.length);
  for (const byte of data) {
    const factor = byte ^ (result[0] ?? 0);
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let i = 0; i < divisor.length; i++) {
      result[i] = (result[i] ?? 0) ^ gfMultiply(divisor[i] ?? 0, factor);
    }
  }
  return result;
}

/* ---------- 数据位流 ---------- */

class BitBuffer {
  readonly bits: number[] = [];

  append(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  }

  get length(): number {
    return this.bits.length;
  }
}

function utf8Bytes(text: string): number[] {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(text));
  }
  return Array.from(unescape(encodeURIComponent(text))).map((char) =>
    char.charCodeAt(0),
  );
}

function addEccAndInterleave(
  data: number[],
  version: number,
  level: QRCodeErrorLevel,
): number[] {
  const numBlocks = numErrorCorrectionBlocks(version, level);
  const blockEccLen = eccCodewordsPerBlock(version, level);
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);
  const divisor = reedSolomonComputeDivisor(blockEccLen);

  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dataLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const dat = data.slice(k, k + dataLen);
    k += dataLen;
    const ecc = reedSolomonComputeRemainder(dat, divisor);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(Array.from(ecc)));
  }

  const result: number[] = [];
  const blockLength = blocks[0]?.length ?? 0;
  for (let i = 0; i < blockLength; i++) {
    for (let j = 0; j < blocks.length; j++) {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
        result.push(blocks[j]![i]!);
      }
    }
  }
  return result;
}

const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
type Mode = 'numeric' | 'alphanumeric' | 'byte';
const modeHeaders = {
  numeric: { indicator: 1, countBits: [10, 12, 14] },
  alphanumeric: { indicator: 2, countBits: [9, 11, 13] },
  byte: { indicator: 4, countBits: [8, 16, 16] },
} as const;

function encodePayload(text: string) {
  const buffer = new BitBuffer();
  let mode: Mode;
  let count = text.length;
  if (/^[0-9]+$/.test(text)) {
    mode = 'numeric';
    for (let i = 0; i < count; i += 3) {
      const group = text.slice(i, i + 3);
      buffer.append(Number(group), group.length * 3 + 1);
    }
  } else if (text.length && Array.from(text).every(char => ALPHANUMERIC.includes(char))) {
    mode = 'alphanumeric';
    for (let i = 0; i < count; i += 2) {
      const first = ALPHANUMERIC.indexOf(text.charAt(i));
      if (i + 1 === count) buffer.append(first, 6);
      else buffer.append(first * 45 + ALPHANUMERIC.indexOf(text.charAt(i + 1)), 11);
    }
  } else {
    mode = 'byte';
    const bytes = utf8Bytes(text);
    count = bytes.length;
    for (const byte of bytes) buffer.append(byte, 8);
  }
  return { mode, count, bits: buffer.bits };
}

const countBitsFor = (mode: Mode, version: number) =>
  modeHeaders[mode].countBits[version < 10 ? 0 : version < 27 ? 1 : 2];

function encodeDataCodewords(
  payload: ReturnType<typeof encodePayload>,
  version: number,
  level: QRCodeErrorLevel,
): number[] {
  const capacityBits = getNumDataCodewords(version, level) * 8;
  const buffer = new BitBuffer();
  buffer.append(modeHeaders[payload.mode].indicator, 4);
  buffer.append(payload.count, countBitsFor(payload.mode, version));
  buffer.bits.push(...payload.bits);

  // 终止符 + 补齐到字节边界
  buffer.append(0, Math.min(4, capacityBits - buffer.length));
  buffer.append(0, (8 - (buffer.length % 8)) % 8);

  const data: number[] = [];
  for (let i = 0; i < buffer.bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (buffer.bits[i + j] ?? 0);
    data.push(byte);
  }
  // 交替填充字节
  for (let pad = 0xec; data.length * 8 < capacityBits; pad ^= 0xec ^ 0x11) {
    data.push(pad);
  }
  return data;
}

/* ---------- 矩阵构建 ---------- */

const MASKS: ReadonlyArray<(x: number, y: number) => boolean> = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

class Matrix {
  readonly size: number;
  readonly modules: boolean[][];
  readonly isFunction: boolean[][];

  constructor(
    readonly version: number,
    readonly level: QRCodeErrorLevel,
  ) {
    this.size = version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => false),
    );
    this.isFunction = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => false),
    );
    this.drawFunctionPatterns();
  }

  private setFunctionModule(x: number, y: number, dark: boolean): void {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return;
    this.modules[y]![x] = dark;
    this.isFunction[y]![x] = true;
  }

  private drawFinderPattern(cx: number, cy: number): void {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
          this.setFunctionModule(x, y, dist !== 2 && dist !== 4);
        }
      }
    }
  }

  private drawAlignmentPattern(cx: number, cy: number): void {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        this.setFunctionModule(
          cx + dx,
          cy + dy,
          Math.max(Math.abs(dx), Math.abs(dy)) !== 1,
        );
      }
    }
  }

  private drawFunctionPatterns(): void {
    const size = this.size;
    // 定位图形与分隔带
    this.drawFinderPattern(3, 3);
    this.drawFinderPattern(size - 4, 3);
    this.drawFinderPattern(3, size - 4);

    // 定时图形
    for (let i = 8; i < size - 8; i++) {
      this.setFunctionModule(i, 6, i % 2 === 0);
      this.setFunctionModule(6, i, i % 2 === 0);
    }

    // 校正图形
    const alignPositions = getAlignmentPatternPositions(this.version);
    const alignCount = alignPositions.length;
    for (let i = 0; i < alignCount; i++) {
      for (let j = 0; j < alignCount; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === 0 && j === alignCount - 1) ||
          (i === alignCount - 1 && j === 0)
        ) {
          continue;
        }
        this.drawAlignmentPattern(alignPositions[i]!, alignPositions[j]!);
      }
    }

    // 预留格式信息区域（先用占位写入，最终由 drawFormatBits 覆盖）
    this.drawFormatBits(0);
    this.drawVersionBits();
  }

  drawFormatBits(mask: number): void {
    const size = this.size;
    const data = (ECL_FORMAT_BITS[this.level] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) {
      rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    }
    const bits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i));
    this.setFunctionModule(8, 7, getBit(bits, 6));
    this.setFunctionModule(8, 8, getBit(bits, 7));
    this.setFunctionModule(7, 8, getBit(bits, 8));
    for (let i = 9; i < 15; i++) {
      this.setFunctionModule(14 - i, 8, getBit(bits, i));
    }

    for (let i = 0; i < 8; i++) {
      this.setFunctionModule(size - 1 - i, 8, getBit(bits, i));
    }
    for (let i = 8; i < 15; i++) {
      this.setFunctionModule(8, size - 15 + i, getBit(bits, i));
    }
    this.setFunctionModule(8, size - 8, true);
  }

  private drawVersionBits(): void {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) {
      rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    }
    const bits = (this.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = getBit(bits, i);
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFunctionModule(a, b, dark);
      this.setFunctionModule(b, a, dark);
    }
  }

  drawCodewords(codewords: readonly number[]): void {
    const size = this.size;
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!this.isFunction[y]![x] && i < codewords.length * 8) {
            this.modules[y]![x] = getBit(codewords[i >>> 3] ?? 0, 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }

  applyMask(mask: number): void {
    const fn = MASKS[mask]!;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (!this.isFunction[y]![x] && fn(x, y)) {
          this.modules[y]![x] = !this.modules[y]![x];
        }
      }
    }
  }

  getPenaltyScore(): number {
    const size = this.size;
    let result = 0;

    // 规则 1：同色连续 5 个以上
    for (let y = 0; y < size; y++) {
      let runColor = false;
      let run = 0;
      for (let x = 0; x < size; x++) {
        if (x === 0 || this.modules[y]![x] !== runColor) {
          runColor = this.modules[y]![x]!;
          run = 1;
        } else {
          run++;
          if (run === 5) result += 3;
          else if (run > 5) result += 1;
        }
      }
    }
    for (let x = 0; x < size; x++) {
      let runColor = false;
      let run = 0;
      for (let y = 0; y < size; y++) {
        if (y === 0 || this.modules[y]![x] !== runColor) {
          runColor = this.modules[y]![x]!;
          run = 1;
        } else {
          run++;
          if (run === 5) result += 3;
          else if (run > 5) result += 1;
        }
      }
    }

    // 规则 2：2×2 同色块
    for (let y = 0; y + 1 < size; y++) {
      for (let x = 0; x + 1 < size; x++) {
        const color = this.modules[y]![x];
        if (
          color === this.modules[y]![x + 1] &&
          color === this.modules[y + 1]![x] &&
          color === this.modules[y + 1]![x + 1]
        ) {
          result += 3;
        }
      }
    }

    // 规则 3：类定位图形比例 1:1:3:1:1
    const finderPattern = [true, false, true, true, true, false, true] as const;
    const hasPattern = (line: boolean[], start: number): boolean => {
      if (start + 7 > line.length) return false;
      for (let i = 0; i < 7; i++) {
        if (line[start + i] !== finderPattern[i]) return false;
      }
      const before = start - 4 >= 0;
      const after = start + 11 <= line.length;
      const lightBefore =
        before &&
        !line[start - 1] &&
        !line[start - 2] &&
        !line[start - 3] &&
        !line[start - 4];
      const lightAfter =
        after &&
        !line[start + 7] &&
        !line[start + 8] &&
        !line[start + 9] &&
        !line[start + 10];
      return lightBefore || lightAfter;
    };
    for (let y = 0; y < size; y++) {
      for (let x = 0; x + 7 <= size; x++) {
        if (hasPattern(this.modules[y]!, x)) result += 40;
      }
    }
    for (let x = 0; x < size; x++) {
      const column: boolean[] = [];
      for (let y = 0; y < size; y++) column.push(this.modules[y]![x]!);
      for (let y = 0; y + 7 <= size; y++) {
        if (hasPattern(column, y)) result += 40;
      }
    }

    // 规则 4：深色模块比例
    let dark = 0;
    for (const row of this.modules) {
      for (const cell of row) if (cell) dark++;
    }
    const total = size * size;
    const k = Math.floor(Math.abs(dark * 20 - total * 10) / total);
    result += k * 10;

    return result;
  }
}

/** 仅供内部测试校验：返回某版本的功能模块分布。 */
export function getFunctionModuleMap(version: number): boolean[][] {
  return new Matrix(version, 'L').isFunction;
}

/** 生成二维码模块矩阵。对超出版本 40 容量的文本会抛出错误。 */
export function encodeQRCode(
  text: string,
  level: QRCodeErrorLevel = 'M',
): QRCodeMatrix {
  if (text.length > 7089) throw new Error('QRCode: 内容超出最大容量。');
  const payload = encodePayload(text);
  let version = 0;
  for (let candidate = MIN_VERSION; candidate <= MAX_VERSION; candidate++) {
    const capacityBits = getNumDataCodewords(candidate, level) * 8;
    const headerBits = 4 + countBitsFor(payload.mode, candidate);
    if (payload.bits.length + headerBits <= capacityBits) {
      version = candidate;
      break;
    }
  }
  if (version === 0) {
    throw new Error(
      `QRCode: 内容过长，版本 1–${MAX_VERSION} 在当前纠错等级下无法容纳。`,
    );
  }

  const data = encodeDataCodewords(payload, version, level);
  const codewords = addEccAndInterleave(data, version, level);

  let best: Matrix | null = null;
  let bestPenalty = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const matrix = new Matrix(version, level);
    matrix.drawCodewords(codewords);
    matrix.applyMask(mask);
    matrix.drawFormatBits(mask);
    const penalty = matrix.getPenaltyScore();
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      best = matrix;
    }
  }

  const matrix = best as Matrix;
  return {
    version: matrix.version,
    size: matrix.size,
    modules: matrix.modules,
    level,
  };
}
