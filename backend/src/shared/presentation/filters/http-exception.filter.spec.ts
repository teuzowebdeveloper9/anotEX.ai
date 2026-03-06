import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';
import type { ArgumentsHost } from '@nestjs/common';

const makeHost = (statusFn = jest.fn(), jsonFn = jest.fn()): ArgumentsHost => ({
  switchToHttp: () => ({
    getResponse: () => ({ status: statusFn.mockReturnValue({ json: jsonFn }) }),
    getRequest: () => ({ method: 'GET', url: '/test' }),
  }),
} as unknown as ArgumentsHost);

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('deve retornar o status code correto para HttpException', () => {
    const statusFn = jest.fn().mockReturnValue({ json: jest.fn() });
    const host = makeHost(statusFn);

    filter.catch(new HttpException('Not found', HttpStatus.NOT_FOUND), host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('deve retornar 500 para erros não esperados', () => {
    const statusFn = jest.fn().mockReturnValue({ json: jest.fn() });
    const host = makeHost(statusFn);

    filter.catch(new Error('Unknown'), host);

    expect(statusFn).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('deve retornar mensagem genérica para erros internos', () => {
    const jsonFn = jest.fn();
    const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    const host = makeHost(statusFn, jsonFn);

    filter.catch(new Error('Detalhe interno'), host);

    const body = jsonFn.mock.calls[0][0];
    expect(body.message).toBe('Internal server error');
    expect(body.message).not.toContain('Detalhe interno');
  });

  it('deve incluir path e timestamp na resposta', () => {
    const jsonFn = jest.fn();
    const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    const host = makeHost(statusFn, jsonFn);

    filter.catch(new HttpException('Bad request', HttpStatus.BAD_REQUEST), host);

    const body = jsonFn.mock.calls[0][0];
    expect(body.path).toBe('/test');
    expect(body.timestamp).toBeDefined();
  });
});
