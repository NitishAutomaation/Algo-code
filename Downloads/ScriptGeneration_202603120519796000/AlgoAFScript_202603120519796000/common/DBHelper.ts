import { CommonUtil } from "./common-util";

export class DbHelper {
  public iterations:number = 10;
  public commonUtil: CommonUtil = new CommonUtil()
  public  NULL_CONSTANT = "NULL_CONSTANT";
  
  public async queryCopiedText(query: string): Promise<string> {
    const constCopiedText = "@copied_text";
    if (!query.includes(constCopiedText)) return query;

    for (let i = 1; i <= this.iterations; i++) {
      const value = `${constCopiedText}${i}`;
      if (query.includes(value)) {
        const replacement =  this.commonUtil.getCopiedCountText(i.toString());
        query = query.replace(new RegExp(value, "g"), replacement);
      }
    }

    if (query.includes(constCopiedText)) {
      const replacement = await this.commonUtil.getCopiedText();
      query = query.replace(new RegExp(constCopiedText, "g"), replacement);
    }

    if (query.includes(this.NULL_CONSTANT)) {
      query = query.replace(new RegExp(`'${this.NULL_CONSTANT}'`, "g"), "null");
    }
    return query;
  }

  public  async textRandomCopiedNumber(query:string): Promise<string> {
    const verifyRmCopiedNumber = "@verifyRandomCopiedNumber";
    if (query.includes(verifyRmCopiedNumber)) {
        for (let i = 1; i <= this.iterations; i++) {
            const value = `${verifyRmCopiedNumber}${i}`;
            if (query.includes(value)) {
                query = query.replace(value,await this.commonUtil.getRandomCopiedCountNumber(i.toString()));
            }
        }
    if (query.includes(verifyRmCopiedNumber)) {
          query = query.replace(verifyRmCopiedNumber,await this.commonUtil.getCopiedRandomNumber().toString());
        }
    }
     return query;
  }

  public async textRandomCopiedText(query: string): Promise<string> {
    const verifyRmCopiedText = "@verifyRandomCopiedText";
    if (!query.includes(verifyRmCopiedText)) {
      return query;
    }
    for (let i = 1; i <= this.iterations; i++) {
      const value = `${verifyRmCopiedText}${i}`;
      if (query.includes(value)) {
        const replacement = await this.commonUtil.getRandomCopiedCountText(i.toString());
        query = query.replace(new RegExp(value, "g"), replacement);
      }
    }
    if (query.includes(verifyRmCopiedText)) {
      const replacement = await CommonUtil.getCopiedRandomText();
      query = query.replace(new RegExp(verifyRmCopiedText, "g"), replacement);
    }
    return query;
  }

  public async replaceGlobalText(query: string): Promise<string> {
    const keyword = "@global_text";
    if (query.includes(keyword)) {
      for (let i = 1; i <= this.iterations; i++) {
        const value = `${keyword}${i}`;
        if (query.includes(value)) {
          const replacement = await this.commonUtil.getGlobalText(i.toString());
          query = query.replace(new RegExp(value, "g"), replacement);
            }
        }
    }
    return query;
  }

  public async globalRandomText(query: string): Promise<string> {
    const globalRmCopiedText = "@globalRanodmCopiedText";
    if (query.includes(globalRmCopiedText)) {
      const regex = /@globalRanodmCopiedText(\d+)/g;
      let match;
      while ((match = regex.exec(query)) !== null) {
        const matchedText = match[0];
        const numberPart = match[1];
        const replacement = await this.commonUtil.getGlobalRandomText(numberPart);
        query = query.replace(matchedText, replacement);
      }
      if (query.includes(globalRmCopiedText)) {
        const replacement = await this.commonUtil.getGlobalRandomText("1");
        query = query.replace(new RegExp(globalRmCopiedText, "g"), replacement);
      }
    }
    else if (query.includes("@")) {
      for (const [key, value] of Object.entries(CommonUtil.globalUserValues)) {
        if (query.includes("@" + key)) {
          query = query.replace(new RegExp("@" + key, "g"), value);
        }
      }
    }
    return query;
  }

  public async alphaNumeric64CopiedText(query: string): Promise<string> {
    const alpaNumConstant64 = "@alphaNumeric64CopiedText";
    if (query.includes(alpaNumConstant64)) {
      for (let i = 1; i <= this.iterations; i++) {
        const value = `${alpaNumConstant64}${i}`;
        if (query.includes(value)) {
          const replacement = await this.commonUtil.getAlphaNum64CopiedCountText(i.toString());
          query = query.replace(new RegExp(value, "g"), replacement);
        }
      }

      if (query.includes(alpaNumConstant64)) {
        const replacement = await this.commonUtil.getAlphaNum64CopiedText();
        query = query.replace(new RegExp(alpaNumConstant64, "g"), replacement);
      }

      if (query.includes(this.NULL_CONSTANT)) {
        query = query.replace(new RegExp(`'${this.NULL_CONSTANT}'`, "g"), "null");
      }
    }
    return query;
  }

  public async alphaNumeric32CopiedText(query: string): Promise<string> {
    const alphaNumConstant = "@alphaNumeric32CopiedText";
    if (!query.includes(alphaNumConstant)) return query;

    for (let i = 1; i <= this.iterations; i++) {
      const value = `${alphaNumConstant}${i}`;
      if (query.includes(value)) {
        const replacement = await this.commonUtil.getAlphaNum32CopiedCountText(i.toString());
        query = query.replace(new RegExp(value, "g"), replacement);
      }
    }

    if (query.includes(alphaNumConstant)) {
      const replacement =  await this.commonUtil.getAlphaNum32CopiedText();
      query = query.replace(new RegExp(alphaNumConstant, "g"), replacement);
    }

    if (query.includes(this.NULL_CONSTANT)) {
      query = query.replace(new RegExp(`'${this.NULL_CONSTANT}'`, "g"), "null");
    }

    return query;
  }

}
