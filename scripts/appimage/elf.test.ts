import { describe, expect, test } from "bun:test";
import { findElfSection } from "./elf";

const ELF_HEADER_SIZE = 0x40;

const SECTION_HEADER_SIZE = 0x40;

/**
 * A little-endian ELF64 image holding the named sections, each zero-filled, and
 * the section name table that names them.
 */
function buildElf(sections: { name: string; size: number }[], { elfClass = 2 } = {}) {
  const entries: { nameOffset: number; offset: number; size: number }[] = [];

  const contents: Buffer[] = [];

  const names = [""];

  let nameOffset = 1;

  let offset = ELF_HEADER_SIZE;

  for (const section of sections) {
    entries.push({ nameOffset, offset, size: section.size });

    contents.push(Buffer.alloc(section.size));

    names.push(section.name);

    nameOffset += section.name.length + 1;

    offset += section.size;
  }

  const nameTable = Buffer.from(`${[...names, ".shstrtab"].join("\0")}\0`, "latin1");

  entries.push({ nameOffset, offset, size: nameTable.length });

  contents.push(nameTable);

  const tableOffset = offset + nameTable.length;

  const header = Buffer.alloc(ELF_HEADER_SIZE);

  header.writeUInt32BE(0x7f454c46, 0);
  header.writeUInt8(elfClass, 4);
  header.writeUInt8(1, 5);
  header.writeBigUInt64LE(BigInt(tableOffset), 0x28);
  header.writeUInt16LE(SECTION_HEADER_SIZE, 0x3a);
  header.writeUInt16LE(entries.length + 1, 0x3c);
  header.writeUInt16LE(entries.length, 0x3e);

  const table = Buffer.alloc((entries.length + 1) * SECTION_HEADER_SIZE);

  entries.forEach((entry, index) => {
    // Index 0 is the reserved null section header, so the entries start at 1
    const at = (index + 1) * SECTION_HEADER_SIZE;

    table.writeUInt32LE(entry.nameOffset, at);
    table.writeBigUInt64LE(BigInt(entry.offset), at + 0x18);
    table.writeBigUInt64LE(BigInt(entry.size), at + 0x20);
  });

  return Buffer.concat([header, ...contents, table]);
}

describe("findElfSection", () => {
  test("finds where a section is and how long it is", () => {
    const image = buildElf([
      { name: ".text", size: 16 },
      { name: ".upd_info", size: 1024 },
    ]);

    expect(findElfSection(image, ".upd_info")).toEqual({
      offset: ELF_HEADER_SIZE + 16,
      size: 1024,
    });
  });

  test("throws when the image has no such section", () => {
    const image = buildElf([{ name: ".text", size: 16 }]);

    expect(() => findElfSection(image, ".upd_info")).toThrow(".upd_info");
  });

  test("throws on anything that is not a little-endian ELF64 image", () => {
    expect(() => findElfSection(Buffer.alloc(4096), ".upd_info")).toThrow("ELF64");

    expect(() =>
      findElfSection(buildElf([{ name: ".upd_info", size: 8 }], { elfClass: 1 }), ".upd_info"),
    ).toThrow("ELF64");
  });
});
