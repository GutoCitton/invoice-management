import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {}

  async processFile(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    const resultados: any[] = [];

    for (const row of rows) {
      try {
        const res = await this.emitirNf(row);
        resultados.push({
          linha: row,
          status: 'sucesso',
          response: res.data,
        });
      } catch (err) {
        resultados.push({
          linha: row,
          status: 'erro',
          erro: err.response?.data || err.message,
        });
      }
    }

    return resultados;
  }

  async emitirNf(dados: any) {
    const token = this.config.get<string>('NFE_IO_TOKEN');
    const baseUrl = this.config.get<string>('NFE_IO_BASE_URL');

    const doc = String(dados.CPF_CNPJ || '').replace(/\D/g, '');
    const type = doc.length === 11 ? 'NaturalPerson' : 'LegalEntity';

    return axios.post(
      `${baseUrl}/companies/${dados.empresa_id}/serviceinvoices`,
      {
        borrower: {
          type,
          name: dados.Nome,
          federalTaxNumber: doc,
          address: {
            country: dados.Endereco_Pais || 'BRA',
            postalCode: String(dados.Endereco_Cep),
            street: dados.Endereco_Logradouro,
            number: String(dados.Endereco_Numero),
            district: dados.Endereco_Bairro,
            city: {
              code: dados.Endereco_Cidade_Codigo,
              name: dados.Endereco_Cidade_Nome,
            },
            state: dados.Endereco_Estado,
          },
        },

        cityServiceCode: dados.Codigo_Servico,
        description: dados.Descricao,
        servicesAmount: Number(dados.Valor),

        federalServiceCode: dados.Codigo_Servico,
        nbsCode: dados.NBS,
      },
      {
        headers: {
          Authorization: `${token}`, // 👈 sem Bearer mesmo
          Accept: 'application/json',
        },
      },
    );
  }
}