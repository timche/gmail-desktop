/**
 * Locates a section in an ELF64 little-endian image. The offsets below are the
 * ones the ELF specification fixes for the file header and a section header.
 */

const ELF_MAGIC = 0x7f454c46;

const ELF_CLASS_64 = 2;

const ELF_DATA_LITTLE_ENDIAN = 1;

const ELF_HEADER_SIZE = 0x40;

const SECTION_HEADER_SIZE = 0x40;

export type ElfSection = { offset: number; size: number };

function readSectionHeader(image: Buffer, at: number) {
  return {
    nameOffset: image.readUInt32LE(at),
    offset: Number(image.readBigUInt64LE(at + 0x18)),
    size: Number(image.readBigUInt64LE(at + 0x20)),
  };
}

function readSectionName(image: Buffer, nameTable: ElfSection, nameOffset: number) {
  const start = nameTable.offset + nameOffset;

  const terminator = image.indexOf(0, start);

  const end = nameTable.offset + nameTable.size;

  return image.toString("latin1", start, terminator === -1 || terminator > end ? end : terminator);
}

export function findElfSection(image: Buffer, name: string): ElfSection {
  if (
    image.length < ELF_HEADER_SIZE ||
    image.readUInt32BE(0) !== ELF_MAGIC ||
    image[4] !== ELF_CLASS_64 ||
    image[5] !== ELF_DATA_LITTLE_ENDIAN
  ) {
    throw new Error("Not a little-endian ELF64 image");
  }

  const tableOffset = Number(image.readBigUInt64LE(0x28));

  const entrySize = image.readUInt16LE(0x3a);

  const entryCount = image.readUInt16LE(0x3c);

  const nameTableIndex = image.readUInt16LE(0x3e);

  if (
    tableOffset === 0 ||
    entrySize < SECTION_HEADER_SIZE ||
    nameTableIndex >= entryCount ||
    tableOffset + entryCount * entrySize > image.length
  ) {
    throw new Error("The ELF image carries no readable section header table");
  }

  const nameTable = readSectionHeader(image, tableOffset + nameTableIndex * entrySize);

  for (let index = 0; index < entryCount; index++) {
    const section = readSectionHeader(image, tableOffset + index * entrySize);

    if (readSectionName(image, nameTable, section.nameOffset) === name) {
      return { offset: section.offset, size: section.size };
    }
  }

  throw new Error(`The ELF image has no ${name} section`);
}
