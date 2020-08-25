import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { PrinterService } from '../services/printer.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { commands } from '../services/printer-commads';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  facturas: any[] = [];

  constructor(
    private apiService: ApiService,
    private printerService: PrinterService,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cargarFacturas();
  }

  cargarFacturas() {
    this.apiService.peticionGet('http://192.168.1.7:3001/factura-siigo')
      .subscribe(
        (data: any) => {
          console.log({ data })
          this.facturas = data.facturas;
        },
        (error: any) => {
          console.log({ error })
        },
        () => {
          console.log('Función cargarFacturas() ha finalizado');
        }
      )
  }

  imprimir(comprobante) {
    this.apiService.peticionGet(`http://192.168.1.7:3001/factura-siigo-pdf-imprimir/${ comprobante }.pdf`)
      .subscribe(
        (data: any) => {
          console.log({data})
        },
        (error: any) => {
          console.log({error})
        },
        () => {

        }
      )
  }

  correrCortar() {
    this.print('DC:0D:30:80:E9:5D', this.construirRecibo({ title: 'PLAYCOMMERCE', text: 'aliensanderdiaz'}));
  }

    async print(device, data) {

      // console.log('Device mac: ', device);
      // console.log('Data: ', data);
  
      const load = await this.loadCtrl.create({
        message: 'Imprimiendo...',
      });
  
      await load.present();
  
      this.printerService.connectBluetooth(device).subscribe(
        (status) => {
          console.log(status);
          this.printerService
            .printData(this.noSpecialChars(data))
            .then( async (printStatus) => {
              await load.dismiss();
              console.log(printStatus);
              let alert = await this.alertCtrl.create({
                message: 'Successful print!',
                buttons: [
                  {
                    text: 'Ok',
                    handler: () => {
                      load.dismiss();
                      this.printerService.disconnectBluetooth();
                    },
                  },
                ],
              });
              await alert.present();
            })
            .catch(async (error) => {
              console.log(error);
              let alert = await this.alertCtrl.create({
                message: 'There was an error printing, please try again!',
                buttons: [
                  {
                    text: 'Ok',
                    handler: () => {
                      load.dismiss();
                      //this.printerService.disconnectBluetooth();
                    },
                  },
                ],
              });
              await alert.present();
            });
        },
        async (error) => {
          console.log(error);
          let alert = await this.alertCtrl.create({
            message:
              'There was an error connecting to the printer, please try again!',
            buttons: [
              {
                text: 'Ok',
                handler: () => {
                  load.dismiss();
                  //this.printerService.disconnectBluetooth();
                },
              },
            ],
          });
          await alert.present();
        },
      );
    }

    noSpecialChars(string) {
      let translate = {
        à: 'a',
        á: 'a',
        â: 'a',
        ã: 'a',
        ä: 'a',
        å: 'a',
        æ: 'a',
        ç: 'c',
        è: 'e',
        é: 'e',
        ê: 'e',
        ë: 'e',
        ì: 'i',
        í: 'i',
        î: 'i',
        ï: 'i',
        ð: 'd',
        ñ: 'n',
        ò: 'o',
        ó: 'o',
        ô: 'o',
        õ: 'o',
        ö: 'o',
        ø: 'o',
        ù: 'u',
        ú: 'u',
        û: 'u',
        ü: 'u',
        ý: 'y',
        þ: 'b',
        ÿ: 'y',
        ŕ: 'r',
        À: 'A',
        Á: 'A',
        Â: 'A',
        Ã: 'A',
        Ä: 'A',
        Å: 'A',
        Æ: 'A',
        Ç: 'C',
        È: 'E',
        É: 'E',
        Ê: 'E',
        Ë: 'E',
        Ì: 'I',
        Í: 'I',
        Î: 'I',
        Ï: 'I',
        Ð: 'D',
        Ñ: 'N',
        Ò: 'O',
        Ó: 'O',
        Ô: 'O',
        Õ: 'O',
        Ö: 'O',
        Ø: 'O',
        Ù: 'U',
        Ú: 'U',
        Û: 'U',
        Ü: 'U',
        Ý: 'Y',
        Þ: 'B',
        Ÿ: 'Y',
        Ŕ: 'R',
      };
      let translate_re = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŕŕÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÝÝÞŸŔŔ]/gim;
      return string.replace(translate_re, function(match) {
        return translate[match];
      });
    }

    construirRecibo(data) {
      let receipt = '';
      receipt += commands.HARDWARE.HW_INIT;
      receipt += commands.TEXT_FORMAT.TXT_4SQUARE;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
      receipt += data.title.toUpperCase();
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_NORMAL;
      receipt += commands.HORIZONTAL_LINE.HR_58MM;
      receipt += commands.EOL;
      receipt += commands.HORIZONTAL_LINE.HR2_58MM;
      receipt += commands.EOL;
      receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
      receipt += data.text;
      //secure space on footer
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += 'TEST_FULL_CUT';
      receipt += commands.EOL;
      receipt += commands.EOL;
      receipt += commands.PAPER.PAPER_FULL_CUT;
      receipt += commands.EOL;
      receipt += commands.EOL;
      // receipt += 'TEST_PART_CUT';
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += commands.PAPER.PAPER_PART_CUT;
      // receipt += 'TEST_CUT_A';
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += commands.PAPER.PAPER_CUT_A;
      // receipt += 'TEST_CUT_B';
      // receipt += commands.EOL;
      // receipt += commands.EOL;
      // receipt += commands.PAPER.PAPER_CUT_B;
  
      return receipt;
    }

}
