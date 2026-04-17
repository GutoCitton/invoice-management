import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './upload.html',
  styleUrls: ['./upload.css'],
})
export class UploadComponent {
  file: File | null = null;
  resultado: any[] = [];
  loading = false;

  total = 0;
  processados = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  async enviar() {
    if (!this.file) return;

    this.loading = true;
    this.processados = 0;
    this.total = 0;

    const formData = new FormData();
    formData.append('file', this.file);

    try {
      console.log("chegou aqui");
      const res = await firstValueFrom(
        this.http.post<any[]>('http://localhost:3000/upload', formData)
      );
       console.log("chegou aqui tbm");

      this.resultado = res;

      this.total = res.length;
      this.processados = res.length; // terminou tudo

    } catch (err) {
      alert('Erro ao enviar');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get progresso() {
    if (!this.total) return 0;
    return Math.round((this.processados / this.total) * 100);
  }
}